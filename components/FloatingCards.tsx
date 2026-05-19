export function FloatingCards() {
  return (
    <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* Card 1 — esquerda, roxo escuro */}
      <div
        className="animate-floating absolute"
        style={{ top: '8%', left: '-4%', animationDelay: '0s' }}
      >
        <div style={{ transform: 'rotate(-12deg)' }}>
          <CardShell gradient="linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" shadow="rgba(124,58,237,0.45)">
            <CardContent number="4242" name="Lucas Ferreira" expiry="08/28" />
          </CardShell>
        </div>
      </div>

      {/* Card 2 — topo direita, cinza escuro */}
      <div
        className="animate-floating absolute"
        style={{ top: '18%', right: '2%', animationDelay: '0.8s' }}
      >
        <div style={{ transform: 'rotate(-6deg)' }}>
          <CardShell gradient="linear-gradient(135deg, #334155 0%, #0f172a 100%)" shadow="rgba(15,23,42,0.40)">
            <CardContent number="8891" name="Ana Costa" expiry="03/27" />
          </CardShell>
        </div>
      </div>

      {/* Card 3 — baixo direita, azul-índigo */}
      <div
        className="animate-floating absolute"
        style={{ bottom: '4%', right: '8%', animationDelay: '1.6s' }}
      >
        <div style={{ transform: 'rotate(8deg)' }}>
          <CardShell gradient="linear-gradient(135deg, #818cf8 0%, #4338ca 100%)" shadow="rgba(67,56,202,0.40)">
            <CardContent number="5573" name="João Silva" expiry="11/29" />
          </CardShell>
        </div>
      </div>
    </div>
  )
}

function CardShell({
  gradient,
  shadow,
  children,
}: {
  gradient: string
  shadow: string
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        width: 280,
        height: 170,
        borderRadius: 20,
        background: gradient,
        boxShadow: `0 25px 50px -12px ${shadow}`,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

function CardContent({ number, name, expiry }: { number: string; name: string; expiry: string }) {
  return (
    <div className="w-full h-full p-5 flex flex-col justify-between relative">
      {/* Círculos decorativos de fundo */}
      <div
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.08)',
          top: -60,
          right: -40,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)',
          top: -20,
          right: 20,
        }}
      />

      {/* Chip dourado */}
      <div
        style={{
          width: 36,
          height: 26,
          borderRadius: 5,
          background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
          opacity: 0.92,
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Número do cartão */}
      <p
        className="text-white/85 text-sm relative z-10"
        style={{ fontFamily: 'monospace', letterSpacing: '0.18em' }}
      >
        •••• •••• •••• {number}
      </p>

      {/* Nome + validade + logo */}
      <div className="flex items-end justify-between relative z-10">
        <div>
          <p className="text-white/45 text-[9px] uppercase tracking-widest mb-0.5">Titular</p>
          <p className="text-white text-xs font-semibold tracking-wide">{name}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-white/45 text-[9px] uppercase tracking-widest mb-0.5">Validade</p>
            <p className="text-white text-xs font-semibold">{expiry}</p>
          </div>
          {/* Logo tipo Mastercard */}
          <div className="relative" style={{ width: 38, height: 24 }}>
            <div
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#eb001b',
                opacity: 0.88,
                left: 0,
                top: 0,
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#f79e1b',
                opacity: 0.88,
                left: 14,
                top: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
