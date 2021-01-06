<template>
  <div>
    <div style="padding: 20px 40px;">
      <div class="enter-area" style="border-left: 6px solid #1d778c;">
        <div>
          <h1>Population Sizes</h1>
          <br>
          <h3>Native Homozygote</h3>
          <h4>Starting population size of native homozygote genotype (AA). The native allele is an allele not targeted to spread in the population via gene drive.</h4>
          <input type="number" v-model="vars.sAA" class="text-input">
          <br><br>
          <h3>Native-Target Heterozygote</h3>
          <h4>Starting population size of native-target heterozygote genotype (AB). The target allele is an allele existing in the population targeted to spread via gene drive.</h4>
          <input type="number" v-model="vars.sAB" class="text-input">
          <br><br>
          <h3>Target Homozygote</h3>
          <h4>Starting population size of target genotype (BB).</h4>
          <input type="number" v-model="vars.sBB" class="text-input">
          <br><br>
          <h3>Native-Engineered Heterozygote</h3>
          <h4>Starting population size of native-engineered heterozygote genotype (ABg). The engineered allele is the same as the target allele equipped with the gene drive mechanism.</h4>
          <input type="number" v-model="vars.sABg" class="text-input">
          <br><br>
          <h3>Target-Engineered Heterozygote</h3>
          <h4>Starting population size of the target-engineered heterozygote genotype (BBg).</h4>
          <input type="number" v-model="vars.sBBg" class="text-input">
          <br><br>
          <h3>Engineered Homozygote</h3>
          <h4>Starting population size of the engineered homozygote genotype (BgBg).  These are likely the genotypes of introduced organisms.</h4>
          <input type="number" v-model="vars.sBgBg" class="text-input">
        </div>
      </div>
      <br><br>
      <div class="enter-area" style="border-left: 6px solid #409a1c;">
        <div>
          <h1>Population Details</h1>
          <br>
          <h3>Self-fertilization Frequency</h3>
          <h4>The proportion of the population that reproduces via self-fertilization in a given generation.  This is not the same as the proportion of offspring produced via self-fertlization, as this value does not reflect costs associated with self-fertilization.</h4>
          <input type="range" v-model="vars.sig" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.sig" class="text-input range" disabled>
          <br><br>
          <h3>Carrying Capacity</h3>
          <h4>The estimated carrying capacity of the population in percent.</h4>
          <input type="range" v-model="vars.carCap" min="0" max="100" step="0.1" style="width: 200px;">
          <input type="text" v-model="vars.carCap" class="text-input range" disabled>
          <br><br>
          <h3>Max Reproduction</h3>
          <h4>The intrinsic growth rate per generation per individual. This is the maximum number of offspring produced without density-dependent limits on population growth.</h4>
          <input type="number" v-model="vars.growthRate" class="text-input">
          <br><br>
          <h3>Inbreeding Cost</h3>
          <h4>The fecundity cost associated with inbreeding in the population, values between [0,1].</h4>
          <input type="range" v-model="vars.inbr" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.inbr" class="text-input range" disabled>
          <br><br>
          <h3>Natural Death Rate</h3>
          <h4>The proportion of individuals that die in a generation as defined by the interval of time from birth to reproductive maturity, values between [0,1].</h4>
          <input type="range" v-model="vars.mu" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.mu" class="text-input range" disabled>
          <br><br>
          <h3>Migration Rate</h3>
          <h4>The proportion of individuals that emigrate from the population and are replaced by a natural outside source via immigration, values between [0,1].</h4>
          <input type="range" v-model="vars.eps" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.eps" class="text-input range" disabled>
          <br><br>
          <h3>Selection Coefficient</h3>
          <h4>The selection pressure in favor of the target allele, values between [-1,1].</h4>
          <input type="range" v-model="vars.rho" min="-1" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.rho" class="text-input range" disabled>
          <br><br>
          <h3>Cost of Target</h3>
          <h4>The cost of maintaining the target allele in the absence of positive selection, values between [0,1]. Leave at default = 0 if the relative fitness is constant throughout the simulation.</h4>
          <input type="range" v-model="vars.beta" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.beta" class="text-input range" disabled>
          <br><br>
          <h3>Dominance Coefficient</h3>
          <h4>The dominance of target allele B over native allele A, values between [0,1].</h4>
          <input type="range" v-model="vars.gamma" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.gamma" class="text-input range" disabled>
          <br><br>
          <h3>Target Penetrance</h3>
          <h4>The expression of the target phenotype as a proportion of full expression, values between [0,1].</h4>
          <input type="range" v-model="vars.xi" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.xi" class="text-input range" disabled>
          <br><br>
        </div>
      </div>
      <br><br>
      <div class="enter-area" style="border-left: 6px solid #2dcadb;">
        <div>
          <h1>Simulation Controls</h1>
          <br>
          <h3>Gene Drive Efficacy</h3>
          <h4>The efficacy of the gene drive homing mechanism, values between [0,1].</h4>
          <input type="range" v-model="vars.efficiency" min="-1" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.efficiency" class="text-input range" disabled>
          <br><br>
          <h3>Gene Drive Cost</h3>
          <h4>The cost of maintaining the gene drive allele, values between [0,1].</h4>
          <input type="range" v-model="vars.beta_g" min="0" max="1" step="0.01" style="width: 200px;">
          <input type="number" v-model="vars.beta_g" class="text-input range" disabled>
          <br><br>
          <h3>Simulated Generations</h3>
          <h4>The number of generations to simulate. More takes longer.</h4>
          <input type="number" v-model="vars.gens" class="text-input">
          <br><br>
        </div>
      </div>
      <br><br>
      <button style="margin: 0 auto;" @click="done">Simulate</button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      vars: {
        sAA: '99',
        sAB: '0.000001',
        sBB: '0.000001',
        sABg: '0.000001',
        sBBg: '0.000001',
        sBgBg: '1',
        sig: '0.5',
        carCap: '100',
        growthRate: '40',
        inbr: '0.7',
        mu: '0.2',
        eps: '0',
        rho: '0.2',
        beta: '0.2',
        gamma: '1',
        xi: '0.8',
        efficiency: '0.9',
        beta_g: '0.1',
        gens: 40
      }
    }
  },
  methods: {
    done() {
      let data = JSON.parse(JSON.stringify(this.vars));

      for (let key in data) {
        data[key] = parseFloat(data[key]);
      }

      this.$router.push({ path: '/simulate?data=' + encodeURIComponent(JSON.stringify(data))});
    }
  },
  mounted() {
    if (this.$route.query.data) {
      this.vars = JSON.parse(this.$route.query.data);
    } else {
      this.$router.push({ path: '/input' });
    }
  }
}
</script>

<style scoped>
.tab-change-enter-active {
  transition: all 250ms ease;
}
.tab-change-active {
  transition-delay: .25s;
}
.tab-change-enter, .tab-change-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.enter-area {
  padding: 10px;
  transition: 250ms ease all;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12), 0 1px 5px 0 rgba(0,0,0,.2);
  border-radius: 6px;
  max-width: 1000px;
  margin: 0 auto;
}

.enter-area h4 {
  font-weight: normal;
  color: #444;
}

.enter-area .text-input {
  margin-top: 10px;
  display: block;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px;
  font-size: 14px;
  background: #ddd;
  transition: all 0.2s ease;
  font-size: 18px;
  padding: 8px;
}

.enter-area .text-input:focus {
  border-color: rgb(99, 200, 217);
  background: transparent;
}

.enter-area .range {
  display: inline-block;
  margin-left: 10px;
  width: 60px;
  background: transparent;
  border: none;
  padding: 0;
}

button {
  padding: 10px 20px;
  border-radius: 4px;
  background: rgb(99, 200, 217);
  color: black;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  display: block;
  margin: auto;
  margin-top: 18px;
}

button:hover {
  box-shadow: 0 1px 1px 0 rgba(99, 200, 217,.45), 0 1px 3px 1px rgba(99, 200, 217,.3);
}

</style>