<template>
  
</template>

<script>
import runSimulation from '../runSimulation2';

export default {
  async mounted() {
    let sim = await runSimulation({
      "A_hw":0.4,
      "B_hw":0.5,
      "popSize_hw":100,
      "initial_pop_size_option":null,
      popSize: 100,
      genes: [
        {
          "sAA":99,
          "sAB":0.000001,
          "sBB":0.000001,
          "sABg":0.000001,
          "sBBg":0.000001,
          "sBgBg":1,
        },
        {
          "sAA":99,
          "sAB":0.000001,
          "sBB":0.000001,
          "sABg":0.000001,
          "sBBg":0.000001,
          "sBgBg":1,
        }
      ],
      "sig":0.5,
      "carCap":100,
      "growthRate":40,
      "inbr":0.7,
      "mu":0.2,
      "eps":0,
      "rho":0.2,
      "beta":0.2,
      "gamma":1,
      "xi":0.8,
      "efficiency":0.9,
      "beta_g":0.1,
      "gens":1
    });

    console.log(sim);
  }
}
</script>