<template>
  <div>
    <div style="padding: 20px 40px;">
      <div>
        <span style="display: block; float: right;">Step 1</span>

        <div v-if="stage == 1" class="enter-area">
          <div>
            <h1>Population Sizes</h1>
            <br><br>

            <div>
              <h3>How many genes (loci)?</h3>
              <input type="number" class="text-input" v-model="vars.num_of_loci" @change="vars.num_of_loci = parseInt(vars.num_of_loci)">
              <br>
            </div>

            <br>

            <div>
              <h3>How do you want to enter population sizes?</h3>
              <input type="radio" value="pop_size_of_each_genotype" v-model="vars.ps_option" id="asdfhjk">
              <label for="asdfhjk" style="margin-left: 5px;">Enter numeric population sizes by genotype</label>
              <br>
              <input type="radio" value="har_win_percent" v-model="vars.ps_option" id="jjkgahsk">
              <label for="jjkgahsk" style="margin-left: 5px;">Enter Harvey-Weinberg percents</label>
              <br><br>
            </div>
          </div>
        </div>


        <div v-if="stage > 1 && vars.ps_option === 'pop_size_of_each_genotype'" class="enter-area">
          <div>
            <h1>Population Sizes (cont)</h1>
            <br><br>

            <h2 style="border-bottom: 4px solid rgb(99, 200, 217); display: inline-block;">Gene {{ vars.genes[stage - 2].name }} Details</h2>

            <br><br>
            
            <h3>Native Homozygote</h3>
            <h4>Starting population size of native homozygote genotype (AA). The native allele is an allele not targeted to spread in the population via gene drive.</h4>
            <input type="number" v-model="vars.genes[stage - 2].sAA" class="text-input">
            <br><br>
            <h3>Native-Target Heterozygote</h3>
            <h4>Starting population size of native-target heterozygote genotype (AB). The target allele is an allele existing in the population targeted to spread via gene drive.</h4>
            <input type="number" v-model="vars.genes[stage - 2].sAB" class="text-input">
            <br><br>
            <h3>Target Homozygote</h3>
            <h4>Starting population size of target genotype (BB).</h4>
            <input type="number" v-model="vars.genes[stage - 2].sBB" class="text-input">
            <br><br>
            <h3>Native-Engineered Heterozygote</h3>
            <h4>Starting population size of native-engineered heterozygote genotype (ABg). The engineered allele is the same as the target allele equipped with the gene drive mechanism.</h4>
            <input type="number" v-model="vars.genes[stage - 2].sABg" class="text-input">
            <br><br>
            <h3>Target-Engineered Heterozygote</h3>
            <h4>Starting population size of the target-engineered heterozygote genotype (BBg).</h4>
            <input type="number" v-model="vars.genes[stage - 2].sBBg" class="text-input">
            <br><br>
            <h3>Engineered Homozygote</h3>
            <h4>Starting population size of the engineered homozygote genotype (BgBg).  These are likely the genotypes of introduced organisms.</h4>
            <input type="number" v-model="vars.genes[stage - 2].sBgBg" class="text-input">

            <br><br>
          </div>
        </div>

        <div v-if="stage === 2 && vars.ps_option === 'har_win_percent'" class="enter-area">
          <div>
            <h1>Population Sizes (cont)</h1>
            <br>

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

        <button v-show="stage !== 0" style="float: left;" @click="stage--">Back</button>
        <button style="float: right;" @click="next">Next</button>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      stage: 1,
      vars: {
        num_of_loci: 2,
        ps_option: 'pop_size_of_each_genotype',
        popSize_hw: 100,
        genes: []
      }
    }
  },
  methods: {
    next() {
      if (this.stage === 1) {

        if (this.vars.genes.length !== this.vars.num_of_loci) {
          this.vars.genes = [];
          for (let i = 0; i < this.vars.num_of_loci; i++) {
            this.vars.genes.push({
              name: i + 1,

              sAA: 99,
              sAB: 0.000001,
              sBB: 0.000001,
              sABg: 0.000001,
              sBBg: 0.000001,
              sBgBg: 1,
              sBgBg: .5,

              // har wein
              A_hw: .5,
              B_hw: .5,
            });
          }
        }
      }
      this.stage++;
    },
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