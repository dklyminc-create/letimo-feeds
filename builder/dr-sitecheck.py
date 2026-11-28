import re,subprocess,csv
x=open('/tmp/dr.xml',encoding='utf8',errors='replace').read()
out=[]
for a,b in re.findall(r'<offer\b([^>]*)>(.*?)</offer>',x,re.S):
  vc=(re.search(r'<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]]*)',b) or [None,''])[1].strip()
  ur=(re.search(r'<url>([^<]*)',b) or [None,''])[1].strip()
  av='T' if 'available="true"' in a else 'F'
  st='?'
  if ur:
    h=subprocess.run(['curl','-sL','--max-time','20',ur],capture_output=True).stdout.decode('utf8','replace')
    i=h.find('<h1'); seg=h[i:i+60000] if i>=0 else h
    m=re.search(r'(Немає в наявності|В наявності|Очікується|Під замовлення|Закінчується)',seg)
    st=m.group(1) if m else '?'
  out.append('%s\tfeed=%s\tsite=%s\t%s'%(vc,av,st,ur))
open('_diag/dr-site.txt','w',encoding='utf8').write('\n'.join(out)+'\n')
