/*
Antoine Model
log10(P) = A − (B / (T + C))
    P = vapor pressure (bar)
    T = temperature (K)
*/


export const Rg = 8.3144;

export function roundQuantity(input,n_digits) {
  if (!isNaN(input) && typeof input === "number") {
    // Input is a valid floating-point number
    const roundedValue = parseFloat(input.toFixed(n_digits));
    return roundedValue;
  } else {
    // Input is not a valid number
    return input;
  }
}

export function Antoine_T_P(T, A,B,C) {
    // Given a temperature in K, get saturation pressure in bar;
    const log_P = A-(B/(T+C));
    const P = 10.0 ** log_P;
    return P;
  }
  
export function Antoine_P_T(P,A,B,C) {
    // Given a pressure P in bar, get boiling point in K;
    const log_P = Math.log10(P);
    const T=B/(A-log_P)-C;
    return T;
  }

export function CC_T_P(T,P0,T0,dHvap) {
    const lnP_P0 = -dHvap/Rg*(1/T-1/T0);
    const P = (Math.E ** lnP_P0) * P0;
    return P;
  }

export function CC_P_T(P,P0,T0,dHvap) {
    const lnP_P0 = Math.log(P/P0);
    const T_T0 = -lnP_P0 / dHvap * Rg; 
    const T = 1/(T_T0+1/T0);
    return T;
  }

export const models = {
    'Antoine': {name_cn: '安托因方程',
                name_en: 'Antoine Equation',
                abbr: 'Antoine',
                point: 'open',
               },
    'CC':      {name_cn:'克劳修斯-克拉珀龙方程',
                name_en: 'Clausius Clapeyron Equation',
                abbr: 'CC',
                point: 'closed',
              }
  }
  
export const substances = {
    'Water':   {name_cn: '水',
                name_en: 'Water',
                abbr: 'Water',
                antoine_params: {A: 5.08354, B:1663.125, C:-45.622, T_lo: 0,T_hi: 133, P_lo: 0.05, P_hi:3.0},
                CC_params: {P0:1.01325, T0:373.15, dHvap:41050},
                color: 'red',
               },
    'Ethanol': {name_cn: '乙醇',
                name_en: 'Ethanol',
                abbr: 'Ethanol',
                antoine_params: {A:5.24677,B:1598.673,C:-46.424, T_lo: 20 ,T_hi: 91, P_lo:0.05 , P_hi:3.0},
                CC_params: {P0:1.01325, T0:351.5, dHvap:42300},
                color: 'blue',
               },

    'Chexane': {name_cn: '环己烷',
               name_en: 'Cyclohexane',
               abbr: 'Chexane',
               antoine_params: {A:4.13983,B:1316.554,C:-35.581, T_lo: 10 ,T_hi: 250, P_lo:0.04 , P_hi:9.0},
               CC_params: {P0:1.01325, T0:353.9, dHvap:33100},
               color: 'green',
              },

    'Benzene': {name_cn: '苯',
              name_en: 'Benzene',
              abbr: 'Benzene',
              antoine_params: {A:4.72583,B:1660.652,C:-1.461, T_lo: 15 ,T_hi: 130, P_lo:0.05 , P_hi:3.5},
              CC_params: {P0:1.01325, T0:353.3, dHvap:33900},
              color: 'orange',
             },    
    'CCl4': {name_cn: '四氯化碳',
             name_en: 'Carbon Tetrachloride',
             abbr: 'CCl4',
             antoine_params: {A:4.02291,B:1221.781,C:-45.739, T_lo: 20 ,T_hi: 80, P_lo:0.1 , P_hi:1.11},
             CC_params: {P0:1.01325, T0:349.8, dHvap:32000},
             color: 'cyan',
            }

  }
