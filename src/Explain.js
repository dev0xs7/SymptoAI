import React from "react";

function Explain() {
  return (
    <div className="explain_container">
      <p>
        <span className="tag" style={{ color: "red" }}>
          Issue :{" "}
        </span>
        The surge in patients seeking medical attention for common ailments such
        as cold, fever, and viral infections, coupled with a shortage of
        healthcare professionals, creates a bottleneck, resulting in
        inefficiency and compromised healthcare delivery.
      </p>
      <p>
        <span className="tag" style={{ color: "green" }}>
          Solution :{" "}
        </span>
        MedAI stands as an avant-garde Medicine Recommendation System
        meticulously crafted to obviate bottlenecks and enhance treatment
        efficacy by automating the prescription process for a spectrum of
        prevalent ailments such as Common Cold, Fever, Stomach Pain, Acne, and
        beyond. This cutting-edge system harnesses the power of Knowledge Graphs
        and expansive Language Models, providing a reservoir of dependable and
        precise prescriptions tailored to patients based on symptomatology and
        comprehensive patient interactions. The implementation of this
        sophisticated system not only alleviates hospital bottlenecks but also
        augments efficiency manifold. Consequently, healthcare practitioners can
        channel their focus towards more intricate cases, fostering an
        unprecedented elevation in overall efficiency for both patients and
        healthcare institutions.
      </p>
      <p>
        <span className="tag" style={{ color: "orange" }}>
          Chat with our System{" "}
        </span>
        - Enter your symptoms into our innovative MedAI system, and unlock a
        personalized Medicine Recommendation that caters specifically to your
        needs. But that's not all – feel free to delve deeper into the medicine
        details. Curious about the price? Wondering about its TypeOfSell? Eager
        to know the Salts Used, How to Use it, or How it Works? Concerned about
        potential side effects? Or perhaps exploring alternate medicines? Our
        comprehensive system is here not just to prescribe but to empower you
        with information. Ask away and embark on a journey of informed
        healthcare tailored just for you!
      </p>
    </div>
  );
}

export default Explain;
