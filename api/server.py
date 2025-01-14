from flask import Flask, request
from flask_cors import CORS, cross_origin
import datetime

from neo4j import GraphDatabase
import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from langchain_community.graphs import Neo4jGraph
import google.generativeai as genai
import re
import pickle


# Initializing flask app
app = Flask(__name__)
CORS(app)
# URI = "neo4j+ssc://1d81e13b.databases.neo4j.io:7687"
# AUTH = ("neo4j", "A4hyvKZoNWNZT4Sr75StTsA-s0W8ZAMHVEQkoHEWjWA")
# OPENAI_API_KEY = "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"


def calculate_cosine_similarity(sentence1, sentence2):
    # Create a TF-IDF vectorizer
    vectorizer = TfidfVectorizer()

    # Transform the sentences into TF-IDF vectors
    vectors = vectorizer.fit_transform([sentence1, sentence2])

    # Calculate the cosine similarity between the two vectors
    similarity = cosine_similarity(vectors[0], vectors[1])[0, 0]

    return similarity


def distinct_diseases(driver):
    records, summary, keys = driver.execute_query(
        "MATCH (d:Disease) RETURN DISTINCT d.name as disease",
        database_="neo4j",
    )
    # Loop through results and do something with them
    disease_list = []
    for disease in records:
        disease_list.append(disease.data()['disease'])

    return disease_list


def get_medicine(driver, Disease_Class):

    records, summary, keys = driver.execute_query(
        "MATCH (d:Disease)<-[:TREATS]-(m:Medicine)-[:INSTANCE_OF]->(c:Class) WHERE d.name = $pred_disease RETURN m.Medicine_Name AS name LIMIT 5",
        pred_disease=Disease_Class,
        database_="neo4j",
    )

    medicine_list = []
    for medicine in records:
        medicine_list.append(medicine.data()['name'])

    return medicine_list


def get_department(Disease_Class):
    label_encoder = pickle.load(open("label_encoder.pkl", 'rb'))
    encoder = pickle.load(open("encoder.pkl", 'rb'))
    MLPClassifierModel = pickle.load(open("mlp_model.pkl", "rb"))
    data = {'Disease': [Disease_Class]}
    test_df = pd.DataFrame(data)
    test = pd.DataFrame(encoder.transform(test_df[['Disease']]).toarray())
    predicted_Dep = label_encoder.inverse_transform(
        MLPClassifierModel.predict(test))
    print("predicting department", predicted_Dep[0])
    return predicted_Dep[0]


def get_therapeutic(Disease_Class):
    encoder = pickle.load(open("encoder.pkl", 'rb'))
    SVMClassifierModel = pickle.load(open("svm_model.pkl", 'rb'))
    data = {'Disease': [Disease_Class]}
    test_df = pd.DataFrame(data)
    test = pd.DataFrame(encoder.transform(test_df[['Disease']]).toarray())
    predicted_Class = SVMClassifierModel.predict(test)
    return predicted_Class[0]


@app.route('/data/', methods=['GET', 'POST'])
def get_recommendation():
    try:
        driver = GraphDatabase.driver(URI, auth=AUTH)
        print(driver)
        print("Connection Established..")
    except Exception as e:
        print("Problem Problem in connection : ", e)

    if request.method == "POST":
        symptom = request.json['payload']

        print("Symptom :: ", symptom)

        # connection to the neo4j instance in aura
        disease_list = distinct_diseases(driver)
        # calculating the similarity between the entered symptom and existing distinct diseases
        dis_data = {'Disease': disease_list}
        diseases = pd.DataFrame(dis_data)
        cosine_sim = diseases['Disease'].map(
            lambda x: calculate_cosine_similarity(x, symptom))

        # if the max of cosine similarity is 0 then it has not matched any of the symptoms

        # we will call the LLM for this purpose to return the symptom for the given disease
        # Getting the most resembling disease by comparing the symptoms
        Disease_Class = disease_list[np.argmax(cosine_sim)]

        # Getting the therapeutic Class of the Medicine for specificity in Querying
        print("Department::", Disease_Class)
        therapeutic_class = get_therapeutic(Disease_Class)
        print("Department::", therapeutic_class)
        department = get_department(Disease_Class)
        print("Department::", department)
        # Getting the medicine recommendation
        medicine_list = get_medicine(driver, Disease_Class)

        driver.close()

        return {"Disease": Disease_Class, "Medicine_Recommendation": medicine_list, "Therapeutic_Class": therapeutic_class, "Department": department}


def extract_query_and_return_key(input_query_result):
    slash_n_pattern = r'[ \n]+'
    ret_pattern = r'RETURN\s+(.*)'
    replacement = ' '

    cleaned_query = re.sub(slash_n_pattern, replacement, input_query_result)
    if cleaned_query:
        match = re.search(ret_pattern, cleaned_query)
        if match:
            extracted_string = match.group(1)
        else:
            extracted_string = ""
    return cleaned_query, extracted_string


def processQueryViaLangChain(query, medName, driver):
    # check on the langchain part of the implementation and gain insights and implement

    query += f'''Medicine - {medName}'''

    print("Query after concatenation :: ", query)
    graph = Neo4jGraph(
        url=URI,
        username="neo4j",
        password="A4hyvKZoNWNZT4Sr75StTsA-s0W8ZAMHVEQkoHEWjWA"
    )

    print(graph.schema)

    genai.configure(api_key="AIzaSyDYGYlXJHj40gXGvmGRsK6cpfmkmpBhviY")

    # Set up the model
    generation_config = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
    }

    # safety_settings = [
    #     {
    #         "category": "HARM_CATEGORY_HARASSMENT",
    #         "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    #     },
    #     {
    #         "category": "HARM_CATEGORY_HATE_SPEECH",
    #         "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    #     },
    #     {
    #         "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
    #         "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    #     },
    #     {
    #         "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    #         "threshold": "BLOCK_MEDIUM_AND_ABOVE"
    #     },
    # ]

    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_ONLY_HIGH"
        },
        {
            "category": "HARM_CATEGORY_HATE_SPEECH",
            "threshold": "BLOCK_ONLY_HIGH"
        },
        {
            "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            "threshold": "BLOCK_ONLY_HIGH"
        },
        {
            "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
            "threshold": "BLOCK_ONLY_HIGH"
        },
    ]

    # model = genai.GenerativeModel(model_name="gemini-pro",
    #                               generation_config=generation_config,
    #                               safety_settings=safety_settings)

    model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                                  generation_config=generation_config,
                                  safety_settings=safety_settings)

    # prompt_parts = [
    #     f'''You are an expert in converting English questions to Neo4j Cypher Graph code! The Graph has following Node Labels - Medicine, Disease, Manufacturer, Class.
    #     The Medicine Node label has the following properties Medicine_Name, MRP, sold_as, salt, prescription, func, altmed and sideEffect.
    #     The Disease Node label has the following properties name.The Manufacturer Node label has the following properties company_name.
    #     The Class Node label has the following properties name.
    #     The Graph has the following Relationship types INSTANCE_OF , MANUFACTURES , TREATS.The Relationship INSTANCE_OF starts from Medicine Node to Class Node.
    #     The Relationship TREATS starts from Medicine Node to Disease Node.
    #     The Relationship MANUFACTURES starts from Manufacturer Node to Medicine Node.\n\n
    #     For example,\n    Example 1 - How much does it cost - Medicine - Bro-Zedex Syrup?, the Cypher command will be something like this\n    ``` \n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.MRP \n    ```\n\n    Example 2 - How is it sold as or packaged ,Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.sold_as\n    ```\n\n    Example 3 - What are the salts found in this Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.salt\n    ```\n\n    Example 4 - Are there any specific instruction or prescription for consuming this Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.prescription\n    ```\n\n    Example 5 - How does it function or operate, Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.func\n    ```\n\n    Example 6 - Are there any alternate medicines for the chosen medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.altmed\n    ```\n\n    Example 7 - Is there any prominent sideEffects reported while consuming this medicine Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN medicine.sideEffect\n    ```\n\n    Example 8 - What class of medicine does it belong to , Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (medicine)-[:INSTANCE_OF]->(class)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN class.name\n    ```\n\n    Example 9 - Who is the supplier or the manufacturer of this Medicine - Bro-Zedex Syrup?\n    ```\n    MATCH (manufacturer)-[:MANUFACTURES]->(medicine)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN manufacturer.company_name\n    ```\n\n    Example 10 - What is the disease it cures or treats? Medicine - Bro-Zedex Syrup\n    ```\n    MATCH (medicine)-[:TREATS]->(disease)\n    WHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\n    RETURN disease.name\n    ```\n    \n    Dont include ``` and \\n in the output\n\n    \"\"\"''', query
    # ]

    convo = model.start_chat(history=[
        {
            "role": "user",
            "parts": ["You are an expert in converting English questions to Neo4j Cypher Graph code! The Graph has following Node Labels - Medicine, Disease, Manufacturer, Class. The Medicine Node label has the following properties Medicine_Name, MRP, sold_as, salt, prescription, func, altmed and sideEffect.The Disease Node label has the following properties name.The Manufacturer Node label has the following properties company_name.The Class Node label has the following properties name. The Graph has the following Relationship types INSTANCE_OF , MANUFACTURES , TREATS.The Relationship INSTANCE_OF starts from Medicine Node to Class Node.The Relationship TREATS starts from Medicine Node to Disease Node.The Relationship MANUFACTURES starts from Manufacturer Node to Medicine Node.\n\nFor example,\nExample 1 - How much does it cost - Medicine - Bro-Zedex Syrup?, the Cypher command will be something like this\n``` \nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.MRP\n```\n\nExample 2 - How is it sold as or packaged ,Medicine - Bro-Zedex Syrup?\n```\nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.sold_as\n```\nExample 3 - What are the salts found in this Medicine - Bro-Zedex Syrup?\n```\nMATCH (medicine)    \nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.salt\n```\nExample 4 - Are there any specific instruction or prescription for consuming this Medicine - Bro-Zedex Syrup?    \n```\nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.prescription\n```\nExample 5 - How does it function or operate, Medicine - Bro-Zedex Syrup?\n```\nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.func\n```\n\nExample 6 - Are there any alternate medicines for the chosen medicine - Bro-Zedex Syrup?\n```\nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.altmed\n```\nExample 7 - Is there any prominent sideEffects reported while consuming this medicine Bro-Zedex Syrup?\n```\nMATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.sideEffect    \n```\nExample 8 - What class of medicine does it belong to , Medicine - Bro-Zedex Syrup?\n```\nMATCH (medicine)-[:INSTANCE_OF]->(class)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN class.name\n```\nExample 9 - Who is the supplier or the manufacturer of this Medicine - Bro-Zedex Syrup?\n```\nMATCH (manufacturer)-[:MANUFACTURES]->(medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN manufacturer.company_name\n```\nExample 10 - What is the disease it cures or treats? Medicine - Bro-Zedex Syrup\n```\nMATCH (medicine)-[:TREATS]->(disease)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN disease.name\n```\nDont include ``` and \\n in the output.\n\nInput : What is the cost ?Medicine - Bro-Zedex Syrup"]
        },
        {
            "role": "model",
            "parts": ["MATCH (medicine)\nWHERE medicine.Medicine_Name=\"Bro-Zedex Syrup\"\nRETURN medicine.MRP"]
        },
    ])

    convo.send_message(query)
    # response = model.generate_content(prompt_parts)
    response = convo.last.text

    print("\nAnswer from PALM:: ", response)

    clean_cypher, extracted_string = extract_query_and_return_key(
        response)

    print("Query :: ", clean_cypher)
    print("Extracted String :: ", extracted_string)

    # Querying the neo4j database for the response

    records, summary, keys = driver.execute_query(
        clean_cypher,
        database_="neo4j",
    )

    # Response Transformer PalM model

    ans = records[0]
    query += f''' Ans : {ans}'''
    print("NLP transition :: ", query)
    response_model = genai.GenerativeModel(model_name="gemini-1.0-pro",
                                           generation_config=generation_config,
                                           safety_settings=safety_settings)

    # response_prompt_parts = [
    #     "You are an expert in understanding the question , taking the answer and formulating the answer as a natural language response in English. You will be given the input question and the Answer concatenated to it with `Ans: `. Using these as a context you will have to generate contextful responses in english.\n\nExample 1 : How much does this cost ? Medicine - Benadryl Syrup Ans: 129 , the response for this query would be like\nThe Benadryl Syrup costs about Rs. 129 !\n\nExample 1 :  How much does this cost ? Medicine - Benadryl Syrup Ans: 129 , the response for this query would be like\nThe Benadryl Syrup costs about Rs. 129 !\nExample 2: Is there any prescription for consuming this? Medicine - Benadryl Syrup  Ans : Take this medicine in the dose and duration as adv…ood, but it is better to take it at a fixed time.\n  Take this medicine in the dose and duration as adv…ood, but it is better to take it at a fixed time.\nExample 3: Who supplies or Manufactures this Medicine - Benadryl Syrup? Ans: Cipla pvt Ltd\n The medicine is manufactured by Cipla pvt Ltd", query
    # ]
    convo = model.start_chat(history=[
        {
            "role": "user",
            "parts": ["You are an expert in understanding the question , taking the answer and formulating the answer as a natural language response in English. You will be given the input question and the Answer concatenated to it with `Ans: `. Using these as a context you will have to generate contextful responses in english.\nExample 1 : How much does this cost ? Medicine - Benadryl Syrup Ans:  <Record medicine.MRP = 129> , the response for this query would be like\nThe Benadryl Syrup costs about Rs. 129 !\n\nExample 2: Is there any prescription for consuming this? Medicine - Benadryl Syrup  Ans : <Record medicine.prescription = 'Take this medicine in the dose and duration as adv…ood, but it is better to take it at a fixed time.'>\nTake this medicine in the dose and duration as adv…ood, but it is better to take it at a fixed time.\n\nExample 3: Who supplies or Manufactures this Medicine - Benadryl Syrup? Ans: <Record medicine.manufacturer='Cipla pvt Ltd'>\nThe medicine is manufactured by Cipla pvt Ltd\n\nInput : what is its cost?Medicine - Allegra 120mg TabletAns : <Record medicine.MRP=198>"]
        },
        {
            "role": "model",
            "parts": ["Allegra 120mg costs about Rs 198."]
        },
    ])
    convo.send_message(query)
    # answer = response_model.generate_content(response_prompt_parts)
    answer = convo.last.text
    print(answer)
    return answer


@app.route('/medquery/', methods=['GET', 'POST'])
def queryprocess():
    try:
        driver = GraphDatabase.driver(URI, auth=AUTH)
        print(driver)
        print("Connection Established..")
    except Exception as e:
        print("Problem Problem in connection : ", e)

    if (request.method == "POST"):
        query = request.json['query']
        medName = request.json['medicine']

        result = processQueryViaLangChain(query, medName, driver)

        print("Result for Query Mech : ", result)
        driver.close()

        return {"Query": query, "Answer": "Right Now API is working", "Result": result}


# Running app
if __name__ == '__main__':
    app.run(debug=True)
