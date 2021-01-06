const tf = require('@tensorflow/tfjs');

function kronekerProduct(a, b) {
  let ar = a.length,
    ac = a[0].length,
    br = b.length,
    bc = b[0].length;

  let rtn = ar * br;
  let ctn = ac * bc;
  let r = [];

  // init result with 0
  for (let i = 0; i < rtn; i++) {
    r.push( Array(ctn).fill(0) );
  }

  // calculate
  for (let i = 0; i < ar; i++)
    for (let j = 0; j < ac; j++)
      for (let k = 0; k < br; k++)
        for (let l = 0; l < bc; l++)
          r[br * i + k][bc * j + l] = a[i][j] * b[k][l];

  return r;
}

export default async function runSimulation(params) {
  // extract values
  let {
    genes,
    sig, // selfing rate (frequency with which snails mate with themselves)
    carCap, // carrying capacity (of population)
    popSize,
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

  carCap = popSize * (.01 * carCap);

  // computed values
  let beta = params.beta * growthRate; // reduction in fecundity due to natural resistance
  let beta_g = params.beta_g * growthRate; // reduction in fecundity due to engineered resistance
  let r_AB = growthRate - gamma * beta; // fecundity of AB genotype
  let r_BB = growthRate - beta; // " BB genotype
  let r_ABg = growthRate - gamma * beta - beta_g; // " ABg genotype
  let r_BBg = growthRate - beta - beta_g; // " BBg genotype
  let r_BgBg = growthRate - beta - 2 * beta_g; // " BgBg genotype

  let selfFertilization = tf.tensor2d([
    [growthRate, 0, 0, 0, 0, 0],
    [r_AB / 4, r_AB / 2, r_AB / 4, 0, 0, 0],
    [0, 0, r_BB, 0, 0, 0],
    [r_ABg / 4, 0, 0, r_ABg * (1 - efficiency) / 2, 0, r_ABg * (efficiency / 2 + 1 / 4)],
    [0, 0, r_BBg / 4, 0, r_BBg * (1 - efficiency) / 2, r_BBg * (efficiency / 2 + 1 / 4)],
    [0, 0, 0, 0, 0, r_BgBg]
  ]);

  // init arrays
  for (let each of genes) {
    each.sAA = [each.sAA];
    each.sAB = [each.sAB];
    each.sBB = [each.sBB];
    each.sABg = [each.sABg];
    each.sBBg = [each.sBBg];
    each.sBgBg = [each.sBgBg];
  }

  for (let i = 1; i <= gens; i++) {
    let f_i = i - 1;

    let matricesForKroneker = [];
    
    for (let each of genes) {

      // decompose from each gene
      let { sAA, sAB, sBB, sABg, sBBg, sBgBg } = each;

      sAA.push(0);
      sAB.push(0);
      sBB.push(0);
      sABg.push(0);
      sBBg.push(0);
      sBgBg.push(0);

      // simulate migration (right now migration is set to zero)
      let sAA_migrate = sAA[f_i] - eps * sAA[f_i];
      let sAB_migrate = sAB[f_i] - eps * sAB[f_i];
      let sBB_migrate = sBB[f_i] - eps * sBB[f_i];
      let sABg_migrate = sABg[f_i] - eps * sABg[f_i];
      let sBBg_migrate = sBBg[f_i] - eps * sBBg[f_i];
      let sBgBg_migrate = sBgBg[f_i] - eps * sBgBg[f_i];

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

      // form whole transition matrix to calculate adjusted growth rates
      let transitionMatrix = tf.tidy(() => {
        let a = tf.mul(genOut, (1 - sig)); // outcrossing
        let b = tf.mul(genIn, sig); // self-fertilization
        // ??? removed inbreeding from this

        let c = tf.add(a, b);

        return c.arraySync();
      });

      // cleanup
      genOut.dispose();
      genIn.dispose();

      let nextGen = tf.tidy(() => {
        let a = tf.tensor2d([sAA[f_i], sAB[f_i], sBB[f_i], sABg[f_i], sBBg[f_i], sBgBg[f_i]], [1, 6]);
        let temp = tf.matMul(a, transitionMatrix);
        return temp.arraySync();
      });

      console.log(nextGen);

      matricesForKroneker.push(nextGen);
      
      nextGen = nextGen[0];

      // calculate cohort sizes in each generation i
      sAA[i] = nextGen[0];
      sAB[i] = nextGen[1];
      sBB[i] = nextGen[2];
      sABg[i] = nextGen[3];
      sBBg[i] = nextGen[4];
      sBgBg[i] = nextGen[5];
    }

    let M;

    if (matricesForKroneker.length > 1) {
      M = matricesForKroneker[0];
      for (let i = 1; i < matricesForKroneker.length; i++) {
        M = kronekerProduct(M, matricesForKroneker[i]);
      }
    } else {
      M = matricesForKroneker[0];
    }

    console.log(M);

  }
}