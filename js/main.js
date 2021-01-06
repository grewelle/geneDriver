'use strict';

async function runSimulation(params) {

  // extract values
  let {
    sAA, // initial population size for wild type AA (susceptible to infection from parasite)
    sAB, // initial population size for heterozygous AB
    sBB, // initial population size for homozygous resistant BB (resistant to infection from parasite),
    sABg, // initial population size for heterozygous engineered resistant ABg
    sBBg, // intial population size for homozygous resistant, heterozygous engineered copy BBg
    sBgBg, // initial population size for homozygous engineered resistant BgBg
    sig, // selfing rate (frequency with which snails mate with themselves)
    carCap, // carrying capacity (of population)
    growthRate, // intrinsic growth rate (number of successful offspring per generation in best conditions),
    inbr, // 1 - cost of inbreeding
    mu, // natural death rate
    eps, // migration parameter (place holder for now)
    rho, // force of infection
    gamma, // dominance coefficient
    xi, // conferred resistance to infection
    efficiency, // gene drive efficiency
    gens // no. of generations
  } = params;

  let popSize = sAA + sAB + sBB + sABg + sBBg + sBgBg; // initial total population size
  carCap = popSize * (.01 * carCap);

  // computed values
  let beta = params.beta * growthRate; // reduction in fecundity due to natural resistance
  let beta_g = params.beta_g * growthRate; // reduction in fecundity due to engineered resistance
  let r_AB = growthRate - gamma * beta; // fecundity of AB genotype
  let r_BB = growthRate - beta; // " BB genotype
  let r_ABg = growthRate - gamma * beta - beta_g; // " ABg genotype
  let r_BBg = growthRate - beta - beta_g; // " BBg genotype
  let r_BgBg = growthRate - beta - 2 * beta_g; // " BgBg genotype

  // init arrays
  sAA = [sAA];
  sAB = [sAB];
  sBB = [sBB];
  sABg = [sABg];
  sBBg = [sBBg];
  sBgBg = [sBgBg];
  popSize = [popSize];

  for (let i = 1; i <= gens; i++) {
    sAA.push(0);
    sAB.push(0);
    sBB.push(0);
    sABg.push(0);
    sBBg.push(0);
    sBgBg.push(0);
    popSize.push(0);

    // simulate migration (right now migration is set to zero)
    let sAA_migrate = sAA[i - 1] - eps * sAA[i - 1];
    let sAB_migrate = sAB[i - 1] - eps * sAB[i - 1];
    let sBB_migrate = sBB[i - 1] - eps * sBB[i - 1];
    let sABg_migrate = sABg[i - 1] - eps * sABg[i - 1];
    let sBBg_migrate = sBBg[i - 1] - eps * sBBg[i - 1];
    let sBgBg_migrate = sBgBg[i - 1] - eps * sBgBg[i - 1];

    // simulate mortality and infection
    let sAA_death = sAA_migrate - sAA_migrate * (mu + (1 - mu) * rho);
    let sAB_death = sAB_migrate - sAB_migrate * (mu + (1 - mu) * rho * (1 - gamma * xi));
    let sBB_death = sBB_migrate - sBB_migrate * (mu + (1 - mu) * rho * (1 - xi));
    let sABg_death = sABg_migrate - sABg_migrate * (mu + (1 - mu) * rho * (1 - gamma * xi));
    let sBBg_death = sBBg_migrate - sBBg_migrate * (mu + (1 - mu) * rho * (1 - xi));
    let sBgBg_death = sBgBg_migrate - sBgBg_migrate * (mu + (1 - mu) * rho * (1 - xi));
    let s_death = sAA_death + sAB_death + sBB_death + sABg_death + sBBg_death + sBgBg_death;

    // calculate genotype frequencies by dividing by total reproductive number of snails
    let p_AA = sAA_death / s_death;
    let p_AB = sAB_death / s_death;
    let p_BB = sBB_death / s_death;
    let p_ABg = sABg_death / s_death;
    let p_BBg = sBBg_death / s_death;
    let p_BgBg = sBgBg_death / s_death;

    let gen1 = [p_AA, p_AB, p_BB, p_ABg, p_BBg, p_BgBg];

    // outcrossing transition matrix (for snails that sexually reproduce, this matrix gives the probabilities of one genotype producing other genotypes in the next generation)
    let temp = 1 - efficiency;

    let genOut = tf.tensor2d([
      [growthRate * p_AA + ((growthRate + r_AB) * p_AB + (growthRate + r_ABg) * p_ABg) / 4, ((growthRate + r_BB) / 2) * p_BB + ((growthRate + r_AB) * p_AB + (growthRate + r_BBg) * p_BBg) / 4, 0, temp * (((growthRate + r_BgBg) / 2) * p_BgBg + ((growthRate + r_ABg) * p_ABg + (growthRate + r_BBg) * p_BBg) / 4), 0, efficiency * (((growthRate + r_BgBg) / 2) * p_BgBg + ((growthRate + r_ABg) * p_ABg + (growthRate + r_BBg) * p_BBg) / 4)],
      [(growthRate + r_AB) * p_AA / 4 + (2 * r_AB * p_AB + (r_AB + r_ABg) * p_ABg) / 8, ((growthRate + r_AB) * p_AA + 2 * r_AB * p_AB + (r_AB + r_BB) * p_BB) / 4 + ((r_AB + r_ABg) * p_ABg + (r_AB + r_BBg) * p_BBg) / 8, (r_AB + r_BB) * p_BB / 4 + (2 * r_AB * p_AB + (r_AB + r_BBg) * p_BBg) / 8, temp * ((r_AB + r_BgBg) * p_BgBg / 4 + ((r_AB + r_ABg) * p_ABg + (r_AB + r_BBg) * p_BBg) / 8), temp * ((r_AB + r_BgBg) * p_BgBg / 4 + ((r_AB + r_ABg) * p_ABg + (r_AB + r_BBg) * p_BBg) / 8), efficiency * ((r_AB + r_BgBg) * p_BgBg / 2 + ((r_AB + r_ABg) * p_ABg + (r_AB + r_BBg) * p_BBg) / 4)],
      [0, (growthRate + r_BB) * p_AA / 2 + ((r_BB + r_AB) * p_AB + (r_BB + r_ABg) * p_ABg) / 4, r_BB * p_BB + ((r_BB + r_AB) * p_AB + (r_BB + r_BBg) * p_BBg) / 4, 0, temp * ((r_BB + r_BgBg) * p_BgBg / 2 + ((r_BB + r_ABg) * p_ABg + (r_BB + r_BBg) * p_BBg) / 4), efficiency * ((r_BB + r_BgBg) * p_BgBg / 2 + ((r_BB + r_ABg) * p_ABg + (r_BB + r_BBg) * p_BBg) / 4)],
      [(growthRate + r_ABg) * p_AA / 4 + ((r_ABg + r_AB) * p_AB + 2 * r_ABg * p_ABg) / 8, (r_ABg + r_BB) * p_BB / 4 + ((r_ABg + r_AB) * p_AB + (r_ABg + r_BBg) * p_BBg) / 8, 0, temp * (((r_ABg + growthRate) * p_AA + 2 * r_ABg * p_ABg + (r_ABg + r_BgBg) * p_BgBg) / 4 + ((r_ABg + r_AB) * p_AB + (r_ABg + r_BBg) * p_BBg) / 8), temp * ((r_ABg + r_BB) * p_BB / 4 + ((r_ABg + r_AB) * p_AB + (r_ABg + r_BBg) * p_BBg) / 8), efficiency * (((r_ABg + growthRate) * p_AA + (r_ABg + r_AB) * p_AB + (r_ABg + r_BB) * p_BB) / 4 + (2 * r_ABg * p_ABg + (r_ABg + r_BBg) * p_BBg + (r_ABg + r_BgBg) * p_BgBg) / 4) + (r_ABg + r_BgBg) * p_BgBg / 4 + ((r_ABg + r_ABg) * p_ABg + (r_BBg + r_ABg) * p_BBg) / 8],
      [0, (growthRate + r_BBg) * p_AA / 4 + ((r_BBg + r_AB) * p_AB + (r_BBg + r_ABg) * p_ABg) / 8, (r_BBg + r_BB) * p_BB / 4 + ((r_BBg + r_AB) * p_AB + 2 * r_BBg * p_BBg) / 8, temp * ((growthRate + r_BBg) * p_AA / 4 + ((r_BBg + r_AB) * p_AB + (r_BBg + r_ABg) * p_ABg) / 8), temp * (((r_BBg + r_BB) * p_BB + (r_BBg + r_BgBg) * p_BgBg + 2 * r_BBg * p_BBg) / 4 + ((r_BBg + r_AB) * p_AB + (r_BBg + r_ABg) * p_ABg) / 8), efficiency * (((r_BBg + growthRate) * p_AA + (r_BBg + r_AB) * p_AB + (r_BBg + r_BB) * p_BB) / 4 + ((r_BBg + r_ABg) * p_ABg + (r_BBg + r_BBg) * p_BBg + (r_BBg + r_BgBg) * p_BgBg) / 4) + (r_BBg + r_BgBg) * p_BgBg / 4 + ((r_BBg + r_ABg) * p_ABg + (r_BBg + r_BBg) * p_BBg) / 8],
      [0, 0, 0, temp * ((growthRate + r_BgBg) * p_AA / 2 + ((r_BgBg + r_AB) * p_AB + (r_BgBg + r_ABg) * p_ABg) / 4), temp * ((r_BgBg + r_BB) * p_BB / 2 + ((r_BgBg + r_AB) * p_AB + (r_BgBg + r_BBg) * p_BBg) / 4), (efficiency / 2) * ((growthRate + r_BgBg) * p_AA + (r_AB + r_BgBg) * p_AB + (r_BB + r_BgBg) * p_BB + (r_ABg + r_BgBg) * p_ABg / 2 + (r_BBg + r_BgBg) * p_BBg / 2) + ((r_ABg + r_BgBg) * p_ABg + (r_BBg + r_BgBg) * p_BBg) / 4 + r_BgBg * p_BgBg]
    ]);

    // self-fertlization transition matrix (for snails that self-fertilize, this matrix gives ")
    let genIn = tf.tensor2d([
      [growthRate, 0, 0, 0, 0, 0],
      [r_AB / 4, r_AB / 2, r_AB / 4, 0, 0, 0],
      [0, 0, r_BB, 0, 0, 0],
      [r_ABg / 4, 0, 0, r_ABg * (1 - efficiency) / 2, 0, r_ABg * (efficiency / 2 + 1 / 4)],
      [0, 0, r_BBg / 4, 0, r_BBg * (1 - efficiency) / 2, r_BBg * (efficiency / 2 + 1 / 4)],
      [0, 0, 0, 0, 0, r_BgBg]
    ]);

    // calculate flux of genes into next generation (gen2)
    // form whole transition matrix to calculate adjusted growth rates (matrix_R)
    let [gen2, matrix_R] = tf.tidy(() => {
      let a = tf.mul(genOut, (1 - sig));
      let b = tf.mul(genIn, sig * inbr);

      let c = tf.add(a, b);
      // console.log(gen1.arraySync())

      return [
        tf.matMul(tf.tensor2d(gen1, [1, 6]), c),
        c.arraySync()
      ]
    });

    // total growth rate of population
    let s_r = tf.tidy(() => {
      let temp = gen2.sum();
      return temp.dataSync()[0];
    });

    // cleanup
    genOut.dispose();
    genIn.dispose();
    gen2.dispose();

    // calculate individual adjusted flux
    let sAA_AA_r = gen1[0] * matrix_R[0][0];
    let sAB_AA_r = gen1[1] * matrix_R[1][0];
    let sBB_AA_r = gen1[2] * matrix_R[2][0];
    let sABg_AA_r = gen1[3] * matrix_R[3][0];
    let sBBg_AA_r = gen1[4] * matrix_R[4][0];
    let sBgBg_AA_r = gen1[5] * matrix_R[5][0];
    let sAA_AB_r = gen1[0] * matrix_R[0][1];
    let sAB_AB_r = gen1[1] * matrix_R[1][1];
    let sBB_AB_r = gen1[2] * matrix_R[2][1];
    let sABg_AB_r = gen1[3] * matrix_R[3][1];
    let sBBg_AB_r = gen1[4] * matrix_R[4][1];
    let sBgBg_AB_r = gen1[5] * matrix_R[5][1];
    let sAA_BB_r = gen1[0] * matrix_R[0][2];
    let sAB_BB_r = gen1[1] * matrix_R[1][2];
    let sBB_BB_r = gen1[2] * matrix_R[2][2];
    let sABg_BB_r = gen1[3] * matrix_R[3][2];
    let sBBg_BB_r = gen1[4] * matrix_R[4][2];
    let sBgBg_BB_r = gen1[5] * matrix_R[5][2];
    let sAA_ABg_r = gen1[0] * matrix_R[0][3];
    let sAB_ABg_r = gen1[1] * matrix_R[1][3];
    let sBB_ABg_r = gen1[2] * matrix_R[2][3];
    let sABg_ABg_r = gen1[3] * matrix_R[3][3];
    let sBBg_ABg_r = gen1[4] * matrix_R[4][3];
    let sBgBg_ABg_r = gen1[5] * matrix_R[5][3];
    let sAA_BBg_r = gen1[0] * matrix_R[0][4];
    let sAB_BBg_r = gen1[1] * matrix_R[1][4];
    let sBB_BBg_r = gen1[2] * matrix_R[2][4];
    let sABg_BBg_r = gen1[3] * matrix_R[3][4];
    let sBBg_BBg_r = gen1[4] * matrix_R[4][4];
    let sBgBg_BBg_r = gen1[5] * matrix_R[5][4];
    let sAA_BgBg_r = gen1[0] * matrix_R[0][5];
    let sAB_BgBg_r = gen1[1] * matrix_R[1][5];
    let sBB_BgBg_r = gen1[2] * matrix_R[2][5];
    let sABg_BgBg_r = gen1[3] * matrix_R[3][5];
    let sBBg_BgBg_r = gen1[4] * matrix_R[4][5];
    let sBgBg_BgBg_r = gen1[5] * matrix_R[5][5];

    temp = (s_death * carCap / (s_death + (carCap - s_death) * Math.exp(-s_r)) - s_death);

    let transitionMatrix = tf.tensor2d([
      [1 - (sAA[i - 1] * (mu + (1 - mu) * rho)) / sAA[i - 1] + sAA_AA_r / (sAA[i - 1] * s_r) * temp, sAA_AB_r / (sAA[i - 1] * s_r) * temp, 0, sAA_ABg_r / (sAA[i - 1] * s_r) * temp, 0, sAA_BgBg_r / (sAA[i - 1] * s_r) * temp],
      [sAB_AA_r / (sAB[i - 1] * s_r) * temp, 1 - (sAB[i - 1] * (mu + (1 - mu) * rho * (1 - gamma * xi))) / sAB[i - 1] + sAB_AB_r / (sAB[i - 1] * s_r) * temp, sAB_BB_r / (sAB[i - 1] * s_r) * temp, sAB_ABg_r / (sAB[i - 1] * s_r) * temp, sAB_BBg_r / (sAB[i - 1] * s_r) * temp, sAB_BgBg_r / (sAB[i - 1] * s_r) * temp],
      [0, sBB_AB_r / (sBB[i - 1] * s_r) * temp, 1 - (sBB[i - 1] * (mu + (1 - mu) * rho * (1 - xi))) / sBB[i - 1] + sBB_BB_r / (sBB[i - 1] * s_r) * temp, 0, sBB_BBg_r / (sBB[i - 1] * s_r) * temp, sBB_BgBg_r / (sBB[i - 1] * s_r) * temp],
      [sABg_AA_r / (sABg[i - 1] * s_r) * temp, sABg_AB_r / (sABg[i - 1] * s_r) * temp, 0, 1 - (sABg[i - 1] * (mu + (1 - mu) * rho * (1 - gamma * xi))) / sABg[i - 1] + sABg_ABg_r / (sABg[i - 1] * s_r) * temp, sABg_BBg_r / (sABg[i - 1] * s_r) * temp, sABg_BgBg_r / (sABg[i - 1] * s_r) * temp],
      [0, sBBg_AB_r / (sBBg[i - 1] * s_r) * temp, sBBg_BB_r / (sBBg[i - 1] * s_r) * temp, sBBg_ABg_r / (sBBg[i - 1] * s_r) * temp, 1 - (sBBg[i - 1] * (mu + (1 - mu) * rho * (1 - xi))) / sBBg[i - 1] + sBBg_BBg_r / (sBBg[i - 1] * s_r) * temp, sBBg_BgBg_r / (sBBg[i - 1] * s_r) * temp],
      [0, 0, 0, sBgBg_ABg_r / (sBgBg[i - 1] * s_r) * temp, sBgBg_BBg_r / (sBgBg[i - 1] * s_r) * temp, 1 - (sBgBg[i - 1] * (mu + (1 - mu) * rho * (1 - xi))) / sBgBg[i - 1] + sBgBg_BgBg_r / (sBgBg[i - 1] * s_r) * temp]
    ]);

    let nextGen = tf.tidy(() => {
      let a = tf.tensor2d([sAA[i - 1], sAB[i - 1], sBB[i - 1], sABg[i - 1], sBBg[i - 1], sBgBg[i - 1]], [1, 6]);
      let temp = tf.matMul(a, transitionMatrix);
      return temp.arraySync();
    });
    
    nextGen = nextGen[0];

    // calculate cohort sizes in each generation i
    sAA[i] = nextGen[0];
    sAB[i] = nextGen[1];
    sBB[i] = nextGen[2];
    sABg[i] = nextGen[3];
    sBBg[i] = nextGen[4];
    sBgBg[i] = nextGen[5];

    // find population size
    popSize[i] = sAA[i] + sAB[i] + sBB[i] + sABg[i] + sBBg[i] + sBgBg[i];

    // cleanup tensors
    transitionMatrix.dispose();
  }

  return {
    sAA,
    sAB,
    sBB,
    sABg,
    sBBg,
    sBgBg,
    gens,
    popSize
  }
}

function calculate() {
  loadingmsg.style.display = 'block';

  let inputs = document.querySelectorAll('input');

  let obj = {};
  for (let input of inputs) {
    let key = input.id.replace('input', '');
    obj[key] = parseFloat(input.value);
  }

  console.time();
  runSimulation(obj).then(({ sAA, sAB, sBB, sABg, sBBg, sBgBg, gens, popSize }) => {
    console.timeEnd();

    loadingmsg.style.display = 'none';

    console.time('plots');

    let t = tf.linspace(0, gens, gens + 1).arraySync();

    function divide(arr, by) {
      return tf.tidy(() => {
        return tf.tensor1d(arr).div(by).arraySync();
      });
    }

    function plot(chart, data) {
      if (chart.chartjs_obj) {
        chart.chartjs_obj.data.labels = t;
        chart.chartjs_obj.data.datasets[0] = data;

        chart.chartjs_obj.update();
      } else {
        chart.chartjs_obj = new Chart(chart.getContext('2d'), {
          type: 'line',
          data: {
            labels: t,
            datasets: [ data ]
          }
        });
      }

      allPlot.chartjs_obj.data.datasets.push(data);
    }

    if (allPlot.chartjs_obj) {
      allPlot.chartjs_obj.data.labels = t;
      allPlot.chartjs_obj.data.datasets = [];
    } else {
      allPlot.chartjs_obj = new Chart(allPlot.getContext('2d'), {
        type: 'line',
        data: {
          labels: t,
          datasets: []
        }
      });
    }

    console.log(popSize);

    plot(susceptiblePlot, {
      label: 'Susceptible',
      fill: true,
      data: divide(sAA, popSize),
      backgroundColor: 'rgba(0, 0, 241, .4)',
      borderColor: 'rgba(0, 0, 241, 1)'
    });

    plot(heterozygousResistantPlot, {
      label: 'Heterozygous Resistant',
      fill: true,
      data: divide(sAB, popSize),
      backgroundColor: 'rgba(241, 0, 0, .4)',
      borderColor: 'rgba(241, 0, 0, 1)'
    });

    plot(homozygousResistantPlot, {
      label: 'Homozygous Resistant',
      fill: true,
      data: divide(sBB, popSize),
      backgroundColor: 'rgba(0, 241, 0, .4)',
      borderColor: 'rgba(0, 241, 0, 1)'
    });

    plot(ABgPlot, {
      label: 'ABg',
      fill: true,
      data: divide(sABg, popSize),
      backgroundColor: 'rgba(200, 120, 0, .4)',
      borderColor: 'rgba(200, 120, 0, 1)'
    });

    plot(BBgPlot, {
      label: 'BBg',
      fill: true,
      data: divide(sBBg, popSize),
      backgroundColor: 'rgba(90, 200, 200, .4)',
      borderColor: 'rgba(90, 200, 200, 1)'
    });

    plot(geneDrivePlot, {
      label: 'Gene Drive',
      fill: true,
      data: divide(sBgBg, popSize),
      backgroundColor: 'rgba(220, 50, 220, .4)',
      borderColor: 'rgba(220, 50, 220, 1)'
    });

    allPlot.chartjs_obj.update();

    console.timeEnd('plots');
  });
}
