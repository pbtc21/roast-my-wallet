import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ANTHROPIC_API_KEY: string
  STX_ADDRESS: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('*', cors())

// Landing page
app.get('/', (c) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roast My Wallet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem;
    }
    .container {
      max-width: 600px;
      width: 100%;
      text-align: center;
    }
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, #ff6b6b, #feca57, #ff6b6b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: fire 2s ease-in-out infinite;
    }
    @keyframes fire {
      0%, 100% { filter: brightness(1); }
      50% { filter: brightness(1.2); }
    }
    .subtitle {
      color: #a0a0a0;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    .input-group {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    input {
      flex: 1;
      padding: 1rem;
      border: 2px solid #333;
      border-radius: 8px;
      background: #1a1a2e;
      color: #fff;
      font-size: 1rem;
      font-family: monospace;
    }
    input:focus {
      outline: none;
      border-color: #ff6b6b;
    }
    button {
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(90deg, #ff6b6b, #ee5a5a);
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    .price {
      color: #feca57;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .roast-container {
      background: #1a1a2e;
      border: 2px solid #333;
      border-radius: 12px;
      padding: 2rem;
      margin-top: 2rem;
      text-align: left;
      display: none;
    }
    .roast-container.visible {
      display: block;
      animation: fadeIn 0.5s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .roast-text {
      font-size: 1.1rem;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #333;
    }
    .stat {
      background: #16213e;
      padding: 1rem;
      border-radius: 8px;
    }
    .stat-label {
      color: #a0a0a0;
      font-size: 0.8rem;
      text-transform: uppercase;
    }
    .stat-value {
      font-size: 1.2rem;
      font-weight: bold;
      color: #feca57;
    }
    .loading {
      display: none;
      margin: 2rem 0;
    }
    .loading.visible {
      display: block;
    }
    .loading-text {
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .footer {
      margin-top: auto;
      padding-top: 2rem;
      color: #666;
      font-size: 0.8rem;
    }
    .footer a {
      color: #ff6b6b;
      text-decoration: none;
    }
    .error {
      color: #ff6b6b;
      margin-top: 1rem;
      display: none;
    }
    .error.visible {
      display: block;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔥 ROAST MY WALLET 🔥</h1>
    <p class="subtitle">Get absolutely destroyed by AI for your crypto decisions</p>

    <div class="input-group">
      <input type="text" id="wallet" placeholder="SP... or SM... address" />
      <button id="roastBtn" onclick="roastMe()">ROAST ME</button>
    </div>
    <p class="price">⚡ 1000 microSTX (~$0.001) per roast</p>

    <div class="loading" id="loading">
      <p class="loading-text">🔥 Analyzing your terrible decisions...</p>
    </div>

    <p class="error" id="error"></p>

    <div class="roast-container" id="roastContainer">
      <div class="stats" id="stats"></div>
      <div class="roast-text" id="roastText"></div>
    </div>
  </div>

  <div class="footer">
    Powered by <a href="https://stx402.com">x402</a> micropayments
  </div>

  <script>
    async function roastMe() {
      const wallet = document.getElementById('wallet').value.trim();
      const btn = document.getElementById('roastBtn');
      const loading = document.getElementById('loading');
      const error = document.getElementById('error');
      const container = document.getElementById('roastContainer');

      if (!wallet || (!wallet.startsWith('SP') && !wallet.startsWith('SM'))) {
        error.textContent = 'Enter a valid Stacks address (SP... or SM...)';
        error.classList.add('visible');
        return;
      }

      error.classList.remove('visible');
      container.classList.remove('visible');
      loading.classList.add('visible');
      btn.disabled = true;

      try {
        const res = await fetch('/roast/' + wallet);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        // Display stats
        const statsHtml = \`
          <div class="stat">
            <div class="stat-label">Total Tokens</div>
            <div class="stat-value">\${data.stats.tokenCount}</div>
          </div>
          <div class="stat">
            <div class="stat-label">STX Balance</div>
            <div class="stat-value">\${data.stats.stxBalance}</div>
          </div>
          <div class="stat">
            <div class="stat-label">NFTs</div>
            <div class="stat-value">\${data.stats.nftCount}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Risk Level</div>
            <div class="stat-value">\${data.stats.riskLevel}</div>
          </div>
        \`;
        document.getElementById('stats').innerHTML = statsHtml;
        document.getElementById('roastText').textContent = data.roast;
        container.classList.add('visible');

      } catch (e) {
        error.textContent = e.message || 'Failed to roast. Maybe you are too poor to roast.';
        error.classList.add('visible');
      } finally {
        loading.classList.remove('visible');
        btn.disabled = false;
      }
    }

    // Enter key support
    document.getElementById('wallet').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') roastMe();
    });
  </script>
</body>
</html>`
  return c.html(html)
})

// Fallback roast generator when AI is not available
function generateFallbackRoast(stxBalance: string, tokenCount: number, nftCount: number, riskLevel: string): string {
  const balance = parseFloat(stxBalance)
  const roasts: string[] = []

  // Balance-based roasts
  if (balance < 10) {
    roasts.push("Your STX balance is so low, even gas fees look at you with pity.")
    roasts.push("I've seen more STX in a testnet faucet than in your wallet.")
  } else if (balance < 100) {
    roasts.push("With that STX balance, you're not even a small fish - you're plankton.")
  } else if (balance > 10000) {
    roasts.push("All that STX and you still can't find a good trade. Money can't buy taste.")
  }

  // Token diversity roasts
  if (tokenCount === 0) {
    roasts.push("Zero tokens? Did you just create this wallet to feel something?")
    roasts.push("Your portfolio is emptier than your understanding of DeFi.")
  } else if (tokenCount < 3) {
    roasts.push("Only holding " + tokenCount + " tokens? You're either a genius or too scared to click buttons.")
  } else if (tokenCount > 20) {
    roasts.push("You've collected " + tokenCount + " different tokens like they're Pokemon cards. Gotta catch every rugpull!")
    roasts.push("Your wallet looks like someone typed random contract addresses and hit 'buy' on each one.")
  } else if (tokenCount > 10) {
    roasts.push("With " + tokenCount + " tokens, your portfolio strategy seems to be 'spray and pray.'")
  }

  // NFT roasts
  if (nftCount > 10) {
    roasts.push("You own " + nftCount + " NFT collections. That's not investing, that's hoarding JPEGs with extra steps.")
  } else if (nftCount > 0) {
    roasts.push("Ah, an NFT collector. Nothing says 'I make great financial decisions' like owning right-clickable art.")
  }

  // Risk level roasts
  if (riskLevel === 'DEGEN') {
    roasts.push("Risk level: DEGEN. Translation: You'll ape into anything with a rocket emoji.")
  } else if (riskLevel === 'CONSERVATIVE') {
    roasts.push("Risk level: CONSERVATIVE. You probably think holding STX is 'living on the edge.'")
  }

  // Shuffle and pick 3-4 roasts
  const shuffled = roasts.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(4, shuffled.length)).join("\n\n")
}

// Roast endpoint
app.get('/roast/:address', async (c) => {
  const address = c.req.param('address')

  // Validate address format
  if (!address.match(/^(SP|SM)[A-Z0-9]{38,40}$/)) {
    return c.json({ error: 'Invalid Stacks address format' }, 400)
  }

  try {
    // Fetch wallet data from Hiro API
    const [balanceRes, holdingsRes] = await Promise.all([
      fetch(`https://api.hiro.so/extended/v1/address/${address}/balances`),
      fetch(`https://api.hiro.so/extended/v1/address/${address}/assets?limit=50`)
    ])

    if (!balanceRes.ok) {
      return c.json({ error: 'Could not fetch wallet data' }, 400)
    }

    const balances = await balanceRes.json() as any
    const holdings = holdingsRes.ok ? await holdingsRes.json() as any : { results: [] }

    // Extract stats
    const stxBalance = (parseInt(balances.stx?.balance || '0') / 1_000_000).toFixed(2)
    const fungibleTokens = Object.keys(balances.fungible_tokens || {})
    const nfts = Object.keys(balances.non_fungible_tokens || {})

    // Build token summary for the roast
    const tokenSummary = fungibleTokens.slice(0, 10).map(token => {
      const parts = token.split('::')
      const name = parts[1] || parts[0].split('.')[1] || 'unknown'
      const balance = balances.fungible_tokens[token]?.balance || '0'
      return `${name}: ${balance}`
    }).join(', ')

    // Calculate risk level based on token diversity
    let riskLevel = 'CONSERVATIVE'
    if (fungibleTokens.length > 20) riskLevel = 'DEGEN'
    else if (fungibleTokens.length > 10) riskLevel = 'RISKY'
    else if (fungibleTokens.length > 5) riskLevel = 'MODERATE'

    // Generate roast with Claude (or fallback)
    let roast: string

    if (c.env.ANTHROPIC_API_KEY) {
      const roastPrompt = `You are a savage crypto roast comedian. Roast this wallet holder BRUTALLY but hilariously based on their portfolio. Be specific about their holdings. Make fun of their choices. Keep it under 200 words. Be absolutely ruthless but funny.

Wallet: ${address}
STX Balance: ${stxBalance} STX
Number of different tokens: ${fungibleTokens.length}
Number of NFT collections: ${nfts.length}
Top tokens: ${tokenSummary || 'None - this person is broke'}
Risk assessment: ${riskLevel}

Generate a brutal roast:`

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': c.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 500,
          messages: [{ role: 'user', content: roastPrompt }]
        })
      })

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json() as any
        roast = claudeData.content?.[0]?.text || generateFallbackRoast(stxBalance, fungibleTokens.length, nfts.length, riskLevel)
      } else {
        roast = generateFallbackRoast(stxBalance, fungibleTokens.length, nfts.length, riskLevel)
      }
    } else {
      roast = generateFallbackRoast(stxBalance, fungibleTokens.length, nfts.length, riskLevel)
    }

    return c.json({
      address,
      stats: {
        stxBalance: `${stxBalance} STX`,
        tokenCount: fungibleTokens.length,
        nftCount: nfts.length,
        riskLevel
      },
      roast
    })

  } catch (error) {
    console.error('Roast error:', error)
    return c.json({ error: 'Failed to analyze wallet' }, 500)
  }
})

// Health check
app.get('/health', (c) => c.json({ status: 'ready to roast', timestamp: new Date().toISOString() }))

export default app
