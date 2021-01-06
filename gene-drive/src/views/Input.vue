<template>
  <div>
    <div style="padding: 20px 40px;">
      <span style="display: block; float: right;">Step {{stage + 1}} of 6</span>
      <transition name="tab-change">
        <div v-if="stage === 0" class="enter-area">
          <div>
            <h1>Population Sizes</h1>
            <br>

            <div>
              <h3>How many genes (loci)?</h3>
              <br>
              <input type="number" class="text-input" v-model="vars.num_of_loci" @change="vars.num_of_loci = parseInt(vars.num_of_loci)">
              <br>
            </div>

            <div>
              <h3>How do you want to enter population sizes?</h3>
              <br>
              <input type="radio" value="pop_size_of_each_genotype" v-model="vars.initial_pop_size_option" id="asdfhjk">
              <label for="asdfhjk" style="margin-left: 5px;">Enter numeric population sizes by genotype</label>
              <br>
              <input type="radio" value="har_win_percent" v-model="vars.initial_pop_size_option" id="jjkgahsk">
              <label for="jjkgahsk" style="margin-left: 5px;">Enter Harvey-Weinberg percents</label>
              <br><br>
            </div>

          </div>
        </div>
        <div v-if="stage === 1" class="enter-area">
          <div>
            <h1>Population Sizes (cont)</h1>
            <br>

            <div v-if="vars.initial_pop_size_option === 'pop_size_of_each_genotype'">
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

            <div v-if="vars.initial_pop_size_option === 'har_win_percent'">
              <h3>Total Population Size</h3>
              <h4>Starting population size.</h4>
              <input type="number" v-model="vars.popSize_hw" class="text-input">
              
              <div v-for="each in vars.genes" :key="each.name">
                <br><br>
                <h2 style="border-bottom: 4px solid rgb(99, 200, 217); display: inline-block;">Gene {{ each.name }} Details</h2>
                <br><br>
                <div style="margin-left: 20px;">

                  <h3>Native Homozygote</h3>
                  <h4>Starting population frequency of native homozygote genotype (A). The native allele is an allele not targeted to spread in the population via gene drive.</h4>
                  <input type="range" v-model="each.A_hw" min="0" max="1" step="0.01" style="width: 200px;">
                  <input type="number" v-model="each.A_hw" class="text-input range" disabled>
                  <br><br>
                  
                  <h3>Target Homozygote</h3>
                  <h4>Starting frequency size of target genotype (B).</h4>
                  <input type="range" v-model="each.B_hw" min="0" max="1" step="0.01" style="width: 200px;">
                  <input type="number" v-model="each.B_hw" class="text-input range" disabled>
                  <br><br>

                  <h3>Engineered Homozygote</h3>
                  <h4>Starting genotype frequency of the engineered homozygote genotype (BgBg). These are likely the genotypes of introduced organisms.</h4>
                  <input type="range" v-model="each.sBgBg" min="0" max="1" step="0.01" style="width: 200px;">
                  <input type="number" v-model="each.sBgBg" class="text-input range" disabled>
                  <br><br>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="stage === 2" class="enter-area">
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
            
          </div>
        </div>
        <div v-if="stage === 3" class="enter-area">
          <div>
            <h1>Population Details (cont)</h1>
            <br>
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
          </div>
        </div>
        <div v-if="stage === 4" class="enter-area">
          <div>
            <h1>Population Details (cont)</h1>
            <br>
            <h3>Selection Coefficient</h3>
            <h4>The selection pressure in favor of the target allele, values between [-1,1].</h4>
            <input type="range" v-model="vars.rho" min="-1" max="1" step="0.01" style="width: 200px;">
            <input type="number" v-model="vars.rho" class="text-input range" disabled>
            <br><br>
          </div>
        </div>
        <div v-if="stage === 5" class="enter-area">
          <div>
            <h1>Simulation Controls</h1>
            <br>
            <h3>Gene Drive Efficacy</h3>
            <h4>The efficacy of the gene drive homing mechanism, values between [0,1].</h4>
            <input type="range" v-model="vars.efficiency" min="-1" max="1" step="0.01" style="width: 200px;">
            <input type="number" v-model="vars.efficiency" class="text-input range" disabled>
            <br><br>
            <h3>Simulated Generations</h3>
            <h4>The number of generations to simulate. More takes longer.</h4>
            <input type="number" v-model="vars.gens" class="text-input">
            <br><br>

            <div>
              <h3>Which simulation model to use?</h3>
              <br>
              <input type="radio" value="additive" v-model="vars.model" id="ryhsfds">
              <label for="ryhsfds" style="margin-left: 5px;">Additive</label>
              <br>
              <input type="radio" value="geometric" v-model="vars.model" id="eijfls">
              <label for="eijfls" style="margin-left: 5px;">Geometric</label>
              <br><br>
            </div>
          </div>
        </div>
      </transition>
      <button v-show="stage !== 0" style="float: left;" @click="stage--">Back</button>
      <button v-show="stage !== 5" style="float: right;" @click="next">Next</button>
      <button v-show="stage == 5" style="float: right;" @click="done">Done!</button>
    </div>
  </div>
</template>

<script>

export default {
  data() {
    return {
      stage: 0,
        
      vars: {
        num_of_loci: 2,
        A_hw: .4,
        B_hw: .5,
        popSize_hw: 100,
        initial_pop_size_option: 'pop_size_of_each_genotype',
        sAA: '99',
        sAB: '0.000001',
        sBB: '0.000001',
        sABg: '0.000001',
        sBBg: '0.000001',
        sBgBg: '1',

        genes: [],

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
        gens: 40,
        model: 'additive'
      }
    }
  },
  methods: {
    next() {
      if (this.stage === 0) {

        if (this.vars.genes.length !== this.vars.num_of_loci) {
          this.vars.genes = [];
          for (let i = 0; i < this.vars.num_of_loci; i++) {
            this.vars.genes.push({
              name: i + 1,


              hw_frequency: .5,
              gamma: 1,
              xi: 0.8,
              beta: 0.2,
              beta_g: 0.1,

              A_hw: .5,
              B_hw: .5,
              sBgBg: .5
            });
          }
        }
      }
      this.stage++;
    },
    done() {
      let data = JSON.parse(JSON.stringify(this.vars));

      /* if (data.initial_pop_size_option === 'har_win_percent') {
        data.sAA = (data.A_hw ** 2) * data.popSize_hw;
        data.sAB = 2 * data.A_hw * data.B_hw * data.popSize_hw;
        data.sBB = (data.B_hw ** 2) * data.popSize_hw;
        data.sABg = 1e-10;
        data.sBBg = 1e-10;
      } */

      for (let key in data) {
        data[key] = parseFloat(data[key]);
      }

      this.$router.push({ path: '/simulate?data=' + encodeURIComponent(JSON.stringify(data))});
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
