
window.addEventListener("load", () => {

  var chart = bb.generate({
    data: {
      columns: [
    ["data", 91.4]
      ],
      type: "gauge", // for ESM specify as: gauge()
      onclick: function(d, i) {
    console.log("onclick", d, i);
     },
      onover: function(d, i) {
    console.log("onover", d, i);
     },
      onout: function(d, i) {
    console.log("onout", d, i);
     }
    },
    gauge: {},
    color: {
      pattern: [
        "#FF0000",
        "#F97600",
        "#F6C600",
        "#60B044"
      ],
      threshold: {
        values: [
          30,
          60,
          90,
          100
        ]
      }
    },
    size: {
      height: 180
    },
    bindto: "#increaseGauge"
  });
})