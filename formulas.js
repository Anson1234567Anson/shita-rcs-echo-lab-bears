/* Shared echo formulas for Sim Lab (and tests). Each function cites its basis.
   Units are stated in each name/comment. Teaching use only. */
(function(root){
const C=1540; // m/s, speed of sound in soft tissue
const deg=d=>d*Math.PI/180;
const F={
 C,
 // Simplified Bernoulli: ΔP (mmHg) = 4 v² (v in m/s)
 bernoulli:v=>4*v*v,
 velFromGradient:dp=>Math.sqrt(Math.max(dp,0)/4),
 // Doppler equation: fd = 2 f0 v cosθ / c  → kHz (f0 MHz, v m/s)
 dopplerShiftKHz:(f0MHz,v,thetaDeg)=>2*f0MHz*1e6*v*Math.cos(deg(thetaDeg))/C/1e3,
 // Measured (displayed) velocity when angle is not corrected
 measuredVel:(v,thetaDeg)=>v*Math.cos(deg(thetaDeg)),
 underestimatePct:thetaDeg=>(1-Math.cos(deg(thetaDeg)))*100,
 // Max PRF set by depth: 13 µs per cm round trip → PRF max (kHz) ≈ 77/depth(cm)
 maxPRFkHz:depthCm=>77/depthCm,
 // Nyquist limit in velocity (m/s): v = (PRF/2)·c / (2 f0 cosθ)
 nyquistVel:(prfKHz,f0MHz,thetaDeg=0)=>(prfKHz*1e3/2)*C/(2*f0MHz*1e6*Math.max(Math.cos(deg(thetaDeg)),1e-6)),
 // Aliased display of a velocity in PW (wraps into ±Nyquist after baseline shift; shift as fraction of Nyquist, + moves baseline down → more room for positive)
 aliasWrap:(v,ny,shift=0)=>{const top=ny*(1+shift),bot=-ny*(1-shift),span=2*ny;let x=v;while(x>top)x-=span;while(x<bot)x+=span;return x},
 // PISA (ASE 2017): flow (mL/s) = 2π r² Va ; EROA (cm²) = flow / Vmax ; RVol (mL) = EROA × VTI
 pisaFlow:(rCm,vaCmS)=>2*Math.PI*rCm*rCm*vaCmS,
 eroa:(rCm,vaCmS,vmaxCmS)=>2*Math.PI*rCm*rCm*vaCmS/vmaxCmS,
 rvol:(eroaCm2,vtiCm)=>eroaCm2*vtiCm,
 pisaRadius:(eroaCm2,vmaxCmS,vaCmS)=>Math.sqrt(eroaCm2*vmaxCmS/(2*Math.PI*vaCmS)),
 // MR severity (ASE 2017 native regurgitation, primary MR): EROA <0.20 mild, ≥0.40 severe; RVol <30 mild, ≥60 severe
 mrGrade:(eroaCm2)=>eroaCm2>=0.40?"severe":eroaCm2<0.20?"mild":"moderate",
 mrGradeRVol:(rv)=>rv>=60?"severe":rv<30?"mild":"moderate",
 // Continuity: AVA = (π (d/2)²) × VTI_LVOT / VTI_AV
 circArea:dCm=>Math.PI*(dCm/2)**2,
 continuityAVA:(lvotDcm,vtiLvot,vtiAv)=>Math.PI*(lvotDcm/2)**2*vtiLvot/vtiAv,
 dvi:(vtiLvot,vtiAv)=>vtiLvot/vtiAv,
 // AS flow model (teaching): VTI_AV = SV / EOA ; Vmax ≈ VTI_AV / (k·ET) with triangular-ish shape k≈0.6 ;
 // mean gradient ≈ 2.4 × Vmax² (empirical, Otto) — approximation, flagged 待核實
 asVTI:(svMl,eoaCm2)=>svMl/eoaCm2,
 asVmax:(svMl,eoaCm2,etS,k=0.6)=>(svMl/eoaCm2)/(k*etS)/100,
 meanFromVmax:v=>2.4*v*v,
 // Severe AS (ASE/EACVI 2017 & ACC/AHA 2020): Vmax ≥4, mean ≥40, AVA ≤1.0, AVAi ≤0.6, DVI ≤0.25 ; low flow SVi <35 mL/m²
 asSevere:o=>({vmax:o.vmax>=4,mean:o.mean>=40,ava:o.ava<=1.0}),
 lowFlow:svi=>svi<35,
 // PV loop (time-varying elastance, Suga–Sagawa teaching model)
 // ESV from coupling: Pes = Ees(ESV−V0) = Ea(EDV−ESV) → ESV = (Ea·EDV + Ees·V0)/(Ea+Ees)
 esv:(edv,Ees,Ea,V0)=>(Ea*edv+Ees*V0)/(Ea+Ees),
 pes:(edv,Ees,Ea,V0)=>{const e=(Ea*edv+Ees*V0)/(Ea+Ees);return Ees*(e-V0)},
 edp:(v,A,k,V0)=>A*(Math.exp(k*(v-V0))-1),
 ef:(edv,esv)=>(edv-esv)/edv*100,
};
if(typeof module!=="undefined")module.exports=F;else root.RCSF=F;
})(this);
