interface WebhookBannerProps {
  status: 'connected' | 'disconnected'
}

export function WebhookBanner({ status }: WebhookBannerProps) {
  const isConnected = status === 'connected'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        borderRadius: 12,
        background: isConnected ? '#ecfdf3' : '#fffbeb',
        border: `1px solid ${isConnected ? '#bbf7d0' : '#fde68a'}`,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isConnected ? '#16a34a' : '#d97706',
            boxShadow: isConnected ? '0 0 0 3px #bbf7d0' : '0 0 0 3px #fde68a',
          }}
        />
        <p style={{ fontSize: 13, fontWeight: 600, color: isConnected ? '#15803d' : '#92400e', margin: 0 }}>
          {isConnected
            ? 'Webhook conectado — suas vendas estão sendo rastreadas automaticamente'
            : 'Seu rastreamento está inativo — configure o webhook para receber atribuições'}
        </p>
      </div>
      {!isConnected && (
        <button
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#d97706',
            color: 'white',
            border: 'none',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Configurar webhook
        </button>
      )}
    </div>
  )
}
