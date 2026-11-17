# Genera mediakit-xperience.html con los paquetes de las dos opciones (cines / malls)
def money(v): return "US$"+format(v,",")
G = {
 "final":{"title":"Gran Final Panamá","tag":"Paquetes · Gran Final","lower":"Gran Final · Panamá · 28 y 29 de agosto",
   "intro":"El cierre del tour: dos días presenciales, finales regionales en el escenario principal y transmisión a toda la región.",
   "tiers":[
    ("Presenting Partner Gran Final",{"cines":100000,"malls":150000},"","La máxima categoría: la marca presenta la final, con exclusividad e integración con la tarjeta prepago de GameLobby.",
      ["Exclusividad en tu categoría","Logo en el pecho del jersey de los finalistas","Backing de entrevistas y laterales del escenario","Watermark premium en la transmisión","Integración con la tarjeta prepago GameLobby y reporte de data transaccional","Misión de marca en la Wallet, recompensas en la Loot Shop y Town Takeover"]),
    ("Strategic Partner Gran Final",{"cines":50000,"malls":75000},"","Co-dueño de las zonas de mayor tráfico (o de las zonas VIP en la opción malls).",
      ["Zonas de alto tráfico o VIP con tu marca","Logo en el brazo del jersey de los finalistas","Backing de entrevistas","Una escena del stream regional (overlay)","Misión de marca en la Wallet","Reporte post-evento de métricas y data"]),
    ("Zone Partner Gran Final",{"cines":25000,"malls":30000},"c/u","Dominio de una zona temática, como Football Fan Arena o Geek & Anime, con captura de datos directa.",
      ["Naming y branding de la zona","Misiones de marca con código QR","Retos y premios de tu marca en la zona","Mención de la zona en el stream","Captura de datos de los participantes"]),
   ]},
 "cam":{"title":"Tour Centroamérica","tag":"Paquetes · Tour regional","lower":"Tour Centroamérica · junio · 6 países",
   "intro":{"cines":"Paradas presenciales en salas Cinemark de los 6 países, con la transmisión de las finales nacionales en pantalla grande.","malls":"Activaciones en los atrios de los principales centros comerciales de los 6 países, conectadas al tráfico del retail."},
   "tiers":[
    ("Presenting Partner Tour CAM",{"cines":80000,"malls":100000},"","La marca dueña del circuito en Guatemala, El Salvador, Honduras, Nicaragua, Costa Rica y Panamá.",
      ["Exclusividad regional en tu categoría","Activación principal en cada parada","Logo en el jersey de los finalistas del circuito","Rotación de escenas del stream regional","Cápsulas «Behind the Scenes» presentadas por tu marca","Reporte de métricas por país"]),
    ("Strategic Partner Tour CAM",{"cines":50000,"malls":50000},"c/u","Co-patrocinio del circuito y de las clasificatorias en los 6 países.",
      ["Activación en cada parada","Branding en los torneos clasificatorios","Logo en el brazo del jersey de los finalistas","Una escena del stream regional","Misión de marca en la Wallet (QR o NFC)","Reporte de participación por país"]),
    ("Zone Partner Tour CAM",{"cines":20000,"malls":20000},"c/u","Activaciones estandarizadas y misiones de marca en todas las paradas.",
      ["Presencia en la plataforma del circuito","Misiones de marca en el ecosistema digital","Sampling y dinámica QR en cada parada","Reporte de participación en misiones"]),
   ]},
 "local":{"title":"Paquetes por país","tag":"Paquetes · Locales","lower":"Paradas nacionales · un país",
   "intro":"Para marcas líderes en un solo mercado. Cada país del tour tiene su propia parada, su circuito digital y su premiación nacional.",
   "tiers":[
    ("Presenting Partner Local",{"cines":25000,"malls":35000},"c/u","Protagonismo total en la parada del país, con exclusividad de categoría a nivel nacional.",
      ["Exclusividad en tu categoría en el país","Activación principal de la parada","Patrocinio del circuito digital del país","Backing de entrevistas y menciones diarias en tarima","Presencia en la premiación nacional"]),
    ("Zone Partner Local",{"cines":7500,"malls":10000},"c/u","Un stand experiencial con retos y recompensas de la Wallet.",
      ["Espacio de activación en la parada","Retos interactivos y captura de leads","Recompensas ligadas a la Wallet","Watermark en la transmisión local"]),
    ("Experience Partner",{"cines":2500,"malls":3500},"c/u","La puerta de entrada: misión en la app y participación en una activación compartida.",
      ["Misión de marca en la app","Activación compartida con sampling","Logo en el carrusel de sponsors locales","Mención del host en tarima"]),
   ]},
 "mx":{"title":"México · Lanzamiento y FrikiPlaza","tag":"Paquetes · México","lower":"México · abril · lanzamiento",
   "intro":"México abre el tour en abril con el lanzamiento del ecosistema y retos express en FrikiPlaza; el líder del ranking nacional viaja a la Gran Final.",
   "tiers":[
    ("Presenting Partner México",{"cines":110000,"malls":150000},"","Co-branding del evento de apertura («GameLobby Xperience presented by tu marca» en la opción malls).",
      ["Exclusividad en tu categoría","Presencia en rueda de prensa y lanzamiento","Estación phygital de marca","Integración con la Wallet: misiones para asistentes","Pauta cruzada con creadores mexicanos"]),
    ("Strategic Partner México",{"cines":55000,"malls":75000},"","Propiedad de una zona clave, como Arena Mobile o Sim Racing Garage.",
      ["Naming de la zona en señalética y pantallas","Torneos customizados y challenges en la app","Leads comerciales con datos de la audiencia","Cápsulas de video de la zona"]),
    ("Zone Partner México",{"cines":22000,"malls":30000},"c/u","Un espacio específico (Cosplay o Casual Gaming) con sampling y misiones QR.",
      ["Branding físico del stand","Sampling de producto","Misiones de la Wallet con QR","Reporte de participación de la zona"]),
    ("Paquete FrikiPlaza",None,"","Retos express de 5 minutos con tu marca en FrikiPlazas; premio «viaje a Panamá» para el líder del ranking.",
      ["Branding en los retos express","Logo en el ranking nacional","Registro de jugadores en la Wallet","Data de participación"]),
   ]},
}
def tier_html(t,opt,top):
    name,prices,cu,summ,items=t
    price = (f'{money(prices[opt])} <small>{cu}</small>' if prices else '<small style="font-size:18px;color:#fff">Mensualidad a consultar</small>')
    lis="".join(f"<li>{i}</li>" for i in items)
    return f'<article class="tier{" tier--top" if top else ""}"><div class="tier__name">{name}</div><div class="tier__price">{price}</div><p class="tier__sum">{summ}</p><ul>{lis}</ul></article>'
def group_slide(key,num,alt):
    g=G[key]; out=[]
    for opt in ("cines","malls"):
        intro = g["intro"][opt] if isinstance(g["intro"],dict) else g["intro"]
        tiers="".join(tier_html(t,opt,i==0) for i,t in enumerate(g["tiers"]))
        out.append(f'<div data-option="{opt}"{" hidden" if opt=="malls" else ""}><p class="lead">{intro}</p><div class="tiers"><div class="tier-row">{tiers}</div></div></div>')
    return f'''<section class="slide{" slide--alt" if alt else ""}" id="paq-{key}"><div class="slide__inner">
<span class="slide__tag">{g["tag"]}</span><h2>{g["title"]}</h2>
<div class="switch no-print" role="group" aria-label="Formato del tour"><button type="button" data-set="cines" aria-pressed="true">Paradas en cines</button><button type="button" data-set="malls" aria-pressed="false">Paradas en malls</button></div><p class="switch__note no-print">El circuito digital y los eventos con tu nombre se cotizan a la medida.</p>
{"".join(out)}
</div><div class="lower"><b>{num:02d}</b><span>{g["lower"]}</span></div></section>'''
pk = group_slide("final",8,False)+group_slide("cam",9,True)+group_slide("local",10,False)+group_slide("mx",11,True)
tpl=open("tools/mediakit/mk_xp_template.html").read()
out=tpl.replace("<!--PAQUETES-->",pk)
import re as _re
_n=[0]
def _num(m):
    _n[0]+=1
    return '<div class="lower"><b>%02d</b>' % (_n[0]+1)
out=_re.sub(r'<div class="lower"><b>\d\d</b>',_num,out)
open("mediakit-xperience.html","w").write(out)
print("ok")
