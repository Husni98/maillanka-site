
(function(){
var R=window.LK_REPORT, el=function(i){return document.getElementById(i)};
if(!R||!R.results||!R.results.length){el('empty').style.display='block';el('content').style.display='none';return}
el('content').style.display='block';
var rows=R.results,N=rows.length;
function pct(a,b){return b?Math.round(a*1000/b)/10:0}
function count(arr,fn){var o={};arr.forEach(function(x){var k=fn(x);o[k]=(o[k]||0)+1});return o}
function bars(target,obj,total,color){
  var keys=Object.keys(obj).sort(function(a,b){return obj[b]-obj[a]});var h='';
  keys.forEach(function(k){var p=pct(obj[k],total);
    h+='<div class="brow"><div class="bl">'+k+'</div><div class="bt"><div class="bf" style="width:'+p+'%;background:'+(color||'#3ddc84')+'"></div></div><div class="bv">'+p+'% <span>('+obj[k]+')</span></div></div>'});
  el(target).innerHTML=h}
el('stamp').textContent=R.scanned_at;el('nscan').textContent=N;el('nlist').textContent=R.domains_listed;
var withMail=rows.filter(function(r){return r.provider!=="No email (no MX record)"});
var M=withMail.length;el('nmail').textContent=M;
bars('prov',count(withMail,function(r){return r.provider}),M);
var sectors=Object.keys(count(rows,function(r){return r.sector})).sort();
var h='<table><thead><tr><th>Sector</th><th>Domains</th><th>Top platform</th><th>SPF</th><th>DMARC set</th><th>DMARC enforced</th></tr></thead><tbody>';
sectors.forEach(function(sec){
  var rs=withMail.filter(function(r){return r.sector===sec});if(!rs.length)return;
  var pc=count(rs,function(r){return r.provider}),top=Object.keys(pc).sort(function(a,b){return pc[b]-pc[a]})[0];
  var spf=rs.filter(function(r){return r.spf!=="none"}).length;
  var dm=rs.filter(function(r){return r.dmarc!=="none"}).length;
  var en=rs.filter(function(r){return r.dmarc==="quarantine"||r.dmarc==="reject"}).length;
  h+='<tr><td>'+sec+'</td><td>'+rs.length+'</td><td>'+top+' ('+pct(pc[top],rs.length)+'%)</td><td>'+pct(spf,rs.length)+'%</td><td>'+pct(dm,rs.length)+'%</td><td>'+pct(en,rs.length)+'%</td></tr>'});
el('sectors').innerHTML=h+'</tbody></table>';
var sec={'SPF record published':withMail.filter(function(r){return r.spf!=="none"}).length,
 'SPF set to strict (-all)':withMail.filter(function(r){return r.spf==="strict"}).length,
 'DMARC record published':withMail.filter(function(r){return r.dmarc!=="none"}).length,
 'DMARC enforced (quarantine or reject)':withMail.filter(function(r){return r.dmarc==="quarantine"||r.dmarc==="reject"}).length,
 'DKIM found (common selectors)':withMail.filter(function(r){return r.dkim}).length};
bars('sec',sec,M,'#58a6ff');
var best=sec['DMARC enforced (quarantine or reject)'];
el('headline').textContent=pct(sec['DMARC record published'],M)+'% of the '+M+' domains with email publish a DMARC record, and '+pct(best,M)+'% enforce it (quarantine or reject).';
})();
