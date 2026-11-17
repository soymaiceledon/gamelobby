import math
C=math.cos(math.radians(30)); S=math.sin(math.radians(30))
class Iso:
    def __init__(s,scale=40,ox=0,oy=0):
        s.k=scale; s.ox=ox; s.oy=oy; s.items=[]; s.pts=[]  # (depth, svg)
    def p(s,x,y,z):
        q=(s.ox+(x-y)*C*s.k, s.oy+(x+y)*S*s.k-z*s.k); s.pts.append(q); return q
    def poly(s,pts,fill,depth,extra=''):
        d=" ".join(f"{a:.1f},{b:.1f}" for a,b in (s.p(*q) for q in pts))
        s.items.append((depth,f'<polygon points="{d}" fill="{fill}" {extra}/>'))
    def box(s,x,y,z,w,d,h,top,left,right,depth=None,stroke='rgba(255,255,255,.08)'):
        dp = depth if depth is not None else (x+w+y+d)+z*0.01
        ex=f'stroke="{stroke}" stroke-width="0.6" stroke-linejoin="round"'
        # +y face (front-left)
        s.poly([(x,y+d,z),(x+w,y+d,z),(x+w,y+d,z+h),(x,y+d,z+h)],left,dp,ex)
        # +x face (front-right)
        s.poly([(x+w,y,z),(x+w,y+d,z),(x+w,y+d,z+h),(x+w,y,z+h)],right,dp+0.001,ex)
        s.poly([(x,y,z+h),(x+w,y,z+h),(x+w,y+d,z+h),(x,y+d,z+h)],top,dp+0.002,ex)
    def face_y(s,x,y,z,w,h,fill,depth,extra=''):   # rect on a +y face plane (y const), x..x+w, z..z+h
        s.poly([(x,y,z),(x+w,y,z),(x+w,y,z+h),(x,y,z+h)],fill,depth,extra)
    def face_x(s,x,y,z,d,h,fill,depth,extra=''):   # rect on +x face plane (x const), y..y+d
        s.poly([(x,y,z),(x,y+d,z),(x,y+d,z+h),(x,y,z+h)],fill,depth,extra)
    def text_y(s,x,y,z,txt,size,fill,depth,cls='',weight=800,anchor='middle',maxw=None):
        tx,ty=s.p(x,y,z)
        s.items.append((depth,f'<text class="{cls}"{f' data-max="{maxw:.0f}"' if maxw else ''} transform="matrix({C:.4f},{S:.4f},0,1,{tx:.1f},{ty:.1f})" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{txt}</text>'))
    def text_x(s,x,y,z,txt,size,fill,depth,cls='',weight=800,anchor='middle',maxw=None):
        tx,ty=s.p(x,y,z)
        s.items.append((depth,f'<text class="{cls}"{f' data-max="{maxw:.0f}"' if maxw else ''} transform="matrix({C:.4f},{-S:.4f},0,1,{tx:.1f},{ty:.1f})" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="{anchor}">{txt}</text>'))
    def floor_text(s,x,y,z,txt,size,fill,depth,cls='',maxw=None):
        tx,ty=s.p(x,y,z)
        s.items.append((depth,f'<text class="{cls}"{f' data-max="{maxw:.0f}"' if maxw else ''} transform="matrix({C:.4f},{S:.4f},{-C:.4f},{S:.4f},{tx:.1f},{ty:.1f})" font-size="{size}" font-weight="800" fill="{fill}" text-anchor="middle">{txt}</text>'))
    def marker(s,x,y,z,n,depth=999):
        tx,ty=s.p(x,y,z)
        s.items.append((depth,f'<g class="mk"><circle cx="{tx:.1f}" cy="{ty:.1f}" r="13" fill="#0a121e" stroke="#ff2db0" stroke-width="2.5"/><text x="{tx:.1f}" y="{ty+5:.1f}" font-size="14" font-weight="700" fill="#fff" text-anchor="middle">{n}</text></g>'))
    def svg(s,w,h,label,pad=40):
        body="\n".join(v for _,v in sorted(s.items,key=lambda t:t[0]))
        xs=[p[0] for p in s.pts]; ys=[p[1] for p in s.pts]
        x0,y0,x1,y1=min(xs)-pad,min(ys)-pad,max(xs)+pad,max(ys)+pad
        return f'<svg viewBox="{x0:.0f} {y0:.0f} {x1-x0:.0f} {y1-y0:.0f}" role="img" aria-label="{label}" xmlns="http://www.w3.org/2000/svg" font-family="Poppins, Arial, sans-serif">{body}</svg>'

B='var(--brand)'; B2='var(--brand-dark)'; B3='var(--brand-light)'
FL='#16233a'; FL2='#0f1a2b'; FL3='#1f3050'
WALL_T='#24324a'; WALL_L='#1a2740'; WALL_R='#131e33'
SCREEN='#06101d'

def stand_zone():
    I=Iso(46,520,90)
    # plataforma 6x6
    I.box(0,0,0,6,6,0.18,'#1b2a44',B2,B2,depth=0)
    I.poly([(0.15,0.15,0.181),(5.85,0.15,0.181),(5.85,5.85,0.181),(0.15,5.85,0.181)],'#1f3050',0.01)
    I.floor_text(3.3,4.0,0.19,'TU MARCA',34,'rgba(255,255,255,.07)',0.02,cls='bn',maxw=230)
    # pared de fondo (y=0) y lateral (x=0)
    I.box(0,0,0.18,6,0.25,3.2,WALL_T,WALL_L,WALL_R,depth=1)
    I.box(0,0.25,0.18,0.25,5.75,3.2,WALL_T,B,B2,depth=1.1)
    # pantalla LED en la pared de fondo
    I.face_y(1.0,0.251,0.9,3.6,2.0,SCREEN,1.2)
    I.face_y(1.12,0.252,1.0,3.36,1.8,'url(#ledGrad)',1.21)
    I.text_y(2.8,0.253,2.3,'RANKING EN VIVO',14,'#8fe2ff',1.22,weight=700)
    for i,(n,pts) in enumerate([('1  NOVA','14,680'),('2  ZERO','12,940'),('3  APEX','11,205')]):
        I.text_y(1.35,0.253,1.85-0.33*i,n,12,'#fff',1.23,weight=600,anchor='start')
        I.text_y(4.25,0.253,1.85-0.33*i,pts,12,'#2ec8ff',1.23,weight=600,anchor='end')
    # logo en pared lateral
    I.text_x(0.251,3.0,2.15,'TU MARCA',34,'#fff',1.3,cls='bn',maxw=230)
    I.text_x(0.251,3.0,1.7,'Zona oficial',13,'rgba(255,255,255,.85)',1.3,weight=600)
    # header colgante
    I.box(0.6,0.0,3.38,4.8,0.3,0.7,B3,B,B2,depth=1.5)
    I.text_y(3.0,0.301,3.55,'TU MARCA',26,'#fff',1.6,cls='bn',maxw=200)
    # estaciones de juego (3)
    for i in range(3):
        x=1.0+i*1.55
        I.box(x,2.0,0.18,1.2,0.6,0.75,'#2a3b57','#1a2740','#131e33',depth=x+2.6+5)
        I.box(x+0.25,2.05,0.93,0.7,0.06,0.45,'#0b1422',SCREEN,'#0b1422',depth=x+2.6+5.1)
        I.face_y(x+0.29,2.111,0.97,0.62,0.37,'url(#scrGrad)',x+2.6+5.2)
        I.box(x+0.35,2.85,0.18,0.5,0.5,0.55,'#0f1a2b',B2,B2,depth=x+3.35+5)
    # mostrador de canje (frente derecha)
    I.box(3.9,4.6,0.18,1.8,0.8,1.0,'#2a3b57',B,B2,depth=20)
    I.text_y(4.8,5.401,0.55,'LOOT SHOP',16,'#fff',20.1,weight=800)
    # tótem QR (frente izquierda)
    I.box(2.2,4.9,0.18,0.45,0.45,1.9,B3,B,B2,depth=18)
    I.face_y(2.27,5.351,1.2,0.31,0.31,'#fff',18.1)
    I.face_y(2.31,5.352,1.24,0.1,0.1,'#0a121e',18.2); I.face_y(2.44,5.352,1.37,0.1,0.1,'#0a121e',18.2); I.face_y(2.42,5.352,1.24,0.04,0.04,'#0a121e',18.2)
    I.text_y(2.425,5.351,0.85,'MISIÓN',9,'#fff',18.3,weight=700)
    # marcadores
    I.marker(4.6,0.3,2.9,1); I.marker(0.3,5.2,3.0,2); I.marker(2.4,2.4,1.8,3); I.marker(2.4,5.1,2.4,4); I.marker(4.8,5.0,1.6,5); I.marker(5.6,0.3,4.2,6)
    return I.svg(1040,640,'Diseño de stand de 6 por 6 metros para Zone Partner')

def stand_stage():
    I=Iso(30,560,70)
    W,D=14,7
    I.box(0,0,0,W,D,0.9,'#1b2a44',B2,B2,depth=0)
    I.poly([(0.2,0.2,0.901),(W-0.2,0.2,0.901),(W-0.2,D-0.2,0.901),(0.2,D-0.2,0.901)],'#1f3050',0.01)
    I.face_y(0.0,D+0.001,0.25,W,0.4,'url(#stripGrad)',0.02)
    I.text_y(W/2,D+0.002,0.33,'GRAN FINAL  ·  PRESENTADA POR TU MARCA',13,'#fff',0.03,cls='bn-title',weight=700,maxw=380)
    # muro LED principal
    I.box(2.5,0,0.9,9,0.35,6.2,WALL_T,WALL_L,WALL_R,depth=1)
    I.face_y(2.8,0.351,1.3,8.4,5.5,SCREEN,1.1)
    I.face_y(2.95,0.352,1.45,8.1,5.2,'url(#ledGrad)',1.11)
    I.text_y(7.0,0.353,6.15,'GAMELOBBY XPERIENCE',14,'#8fe2ff',1.12,weight=700)
    I.text_y(7.0,0.353,4.3,'TU MARCA',40,'#fff',1.13,cls='bn',maxw=220)
    I.text_y(7.0,0.353,3.4,'GRAN FINAL REGIONAL',16,'#fff',1.14,weight=700)
    # torres laterales con color de marca
    for x in (0.4,11.9):
        I.box(x,0.3,0.9,1.7,0.6,5.6,B3,B,B2,depth=2+x/20)
        I.text_x(x+1.701,0.6,3.6,'TU MARCA',14,'#fff',2.1+x/20,cls='bn',maxw=60) if x>5 else I.text_y(x+0.85,0.901,3.6,'TU MARCA',13,'#fff',2.1,cls='bn',maxw=46)
    # mesas de equipos
    for j,x in enumerate((3.0,8.2)):
        I.box(x,3.2,0.9,2.8,0.9,0.8,'#2a3b57',B,B2,depth=10+j)
        I.text_y(x+1.4,4.101,1.25,'TU MARCA',12,'#fff',10.1+j,cls='bn',maxw=74)
        for k in range(3):
            I.box(x+0.25+k*0.85,3.25,1.7,0.6,0.06,0.4,'#0b1422',SCREEN,'#0b1422',depth=10.2+j)
    # backing de entrevistas (frente izquierda, sobre el piso del público)
    I.box(-3.2,5.2,0,3.0,0.2,2.4,WALL_T,'#f2f5fa',WALL_R,depth=30)
    for r in range(3):
        for c in range(3):
            I.text_y(-2.7+c*1.0,5.401,0.55+r*0.7,'MARCA',9,B,30.1,cls='bn-sm',weight=800,maxw=27)
    # piso de público con logo
    I.floor_text(9.0,10.0,0,'TU MARCA',50,'rgba(255,255,255,.06)',0.001,cls='bn',maxw=300)
    I.marker(10.6,0.6,6.0,1); I.marker(1.25,0.9,6.8,2); I.marker(4.4,4.2,2.0,3); I.marker(-1.7,5.5,3.0,4); I.marker(7.0,D,0.0,5)
    return I.svg(1040,640,'Diseño de tarima principal con branding de Presenting Partner')

def stand_lobby():
    I=Iso(52,470,110)
    W,D=5,4
    I.box(0,0,0,W,D,0.12,'#1b2a44',B2,B2,depth=0)
    I.poly([(0.1,0.1,0.121),(W-0.1,0.1,0.121),(W-0.1,D-0.1,0.121),(0.1,D-0.1,0.121)],'#1f3050',0.01)
    # arco de entrada
    I.box(0.2,3.4,0.12,0.35,0.35,2.6,B3,B,B2,depth=20)
    I.box(4.45,3.4,0.12,0.35,0.35,2.6,B3,B,B2,depth=21)
    I.box(0.2,3.4,2.72,4.6,0.35,0.6,B3,B,B2,depth=22)
    I.text_y(2.5,3.751,2.85,'TU MARCA',24,'#fff',22.1,cls='bn',maxw=200)
    # pantalla de ranking (fondo)
    I.box(0.6,0.0,0.12,3.8,0.2,2.7,WALL_T,WALL_L,WALL_R,depth=1)
    I.face_y(0.75,0.201,0.6,3.5,2.0,'url(#ledGrad)',1.1)
    I.text_y(2.5,0.202,2.15,'RETO EXPRESS · 5 MIN',13,'#8fe2ff',1.2,weight=700)
    I.text_y(2.5,0.202,1.45,'¿Superas 01:24?',22,'#fff',1.3,weight=800)
    # 2 estaciones de reto
    for i,x in enumerate((0.7,2.1)):
        I.box(x,0.9,0.12,1.3,0.55,0.8,'#3d5580','#2a3b57','#22314d',depth=8+i)
        I.box(x+0.4,1.65,0.12,0.45,0.45,0.5,'#0f1a2b',B,B2,depth=8.5+i)
        I.box(x+0.3,0.95,0.92,0.7,0.05,0.45,'#0b1422',SCREEN,'#0b1422',depth=8.1+i)
        I.face_y(x+0.34,1.001,0.96,0.62,0.37,'url(#scrGrad)',8.2+i)
    # mesa de registro Wallet
    I.box(3.5,1.5,0.12,1.2,0.6,0.95,'#2a3b57',B,B2,depth=12)
    I.text_y(4.1,2.101,0.5,'REGÍSTRATE',11,'#fff',12.1,weight=800)
    I.marker(2.5,3.6,3.6,1); I.marker(4.2,0.2,3.0,2); I.marker(1.35,1.2,2.0,3); I.marker(4.1,1.8,1.5,4)
    return I.svg(1040,640,'Diseño de activación en lobby de cine o atrio de centro comercial')

if __name__=='__main__':
    import json
    json.dump({'zone':stand_zone(),'stage':stand_stage(),'lobby':stand_lobby()},open('tools/mediakit/stands.json','w'))
    print('ok')
