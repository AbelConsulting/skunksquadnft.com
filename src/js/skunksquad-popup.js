// skunksquad-popup.js
// Externalizes popup card logic for CSP compliance

function showWalletMintCard() {
    const overlay = document.getElementById('wallet-mint-card-overlay');
    const card = document.getElementById('wallet-mint-card');
    const closeBtn = document.getElementById('wmc-close');
    const status = document.getElementById('wmc-status');
    const walletSection = document.getElementById('wmc-wallet-section');
    const mintSection = document.getElementById('wmc-mint-section');
    const mintBtn = document.getElementById('wmc-mint-btn');
    const mintBtnText = document.getElementById('wmc-mint-btn-text');
    const mintBtnSpinner = document.getElementById('wmc-mint-btn-spinner');
    const qtyInput = document.getElementById('wmc-quantity');
    const qtyDec = document.getElementById('wmc-qty-dec');
    const qtyInc = document.getElementById('wmc-qty-inc');
    const total = document.getElementById('wmc-total');

    overlay.style.display = 'flex';
    status.textContent = '';
    mintBtn.disabled = true;
    mintBtn.setAttribute('aria-busy', 'false');
    mintBtnText.textContent = 'Mint NFT';
    mintBtnSpinner.style.display = 'none';
    mintSection.style.display = 'none';

    // Wallet status
    if (window.walletManager && window.walletManager.isConnected && window.walletManager.accounts.length > 0) {
        walletSection.innerHTML = `<div style='color:#22c55e;margin-bottom:0.5em;'>Wallet Connected</div><div style='font-size:0.95em;color:#fff;'>${window.walletManager.shortenAddress(window.walletManager.accounts[0])}</div>`;
        mintSection.style.display = 'block';
        mintBtn.disabled = false;
        updateTotal();
    } else {
        walletSection.innerHTML = `<button class='btn btn-primary' id='wmc-connect-btn' style='width:100%;font-size:1.1em;'>Connect Wallet</button>`;
        mintSection.style.display = 'none';
        mintBtn.disabled = true;
        setTimeout(() => {
            const connectBtn = document.getElementById('wmc-connect-btn');
            if (connectBtn) {
                connectBtn.onclick = async () => {
                    connectBtn.disabled = true;
                    connectBtn.textContent = 'Connecting...';
                    status.textContent = 'Connecting wallet...';
                    status.style.color = '#94a3b8';
                    if (!window.walletManager) window.initWalletManager();
                    const connected = await window.walletManager.connectWallet();
                    if (connected) {
                        walletSection.innerHTML = `<div style='color:#22c55e;margin-bottom:0.5em;'>Wallet Connected</div><div style='font-size:0.95em;color:#fff;'>${window.walletManager.shortenAddress(window.walletManager.accounts[0])}</div>`;
                        mintSection.style.display = 'block';
                        mintBtn.disabled = false;
                        updateTotal();
                        status.textContent = '';
                    } else {
                        connectBtn.disabled = false;
                        connectBtn.textContent = 'Connect Wallet';
                        status.textContent = 'Failed to connect wallet.';
                        status.style.color = '#ef4444';
                    }
                };
            }
        }, 100);
    }

    // Quantity controls and dynamic price updater
    async function getMintPriceEth() {
        if (!window.walletManager) window.initWalletManager();
        if (window.walletManager && window.walletManager.smartPrice) {
            return parseFloat(window.walletManager.smartPrice);
        }
        return 0.01;
    }
    async function updateTotal() {
        const price = await getMintPriceEth();
        const qty = parseInt(qtyInput.value) || 1;
        total.textContent = `${(price * qty).toFixed(4)} ETH`;
    }
    qtyDec.onclick = async () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val > 1) qtyInput.value = val - 1;
        await updateTotal();
    };
    qtyInc.onclick = async () => {
        let val = parseInt(qtyInput.value) || 1;
        if (val < 10) qtyInput.value = val + 1;
        await updateTotal();
    };
    qtyInput.oninput = updateTotal;
    updateTotal();

    // Mint button logic
    mintBtn.onclick = async () => {
        mintBtn.disabled = true;
        mintBtn.setAttribute('aria-busy', 'true');
        mintBtnSpinner.style.display = 'inline-block';
        mintBtnText.textContent = 'Processing...';
        status.textContent = '';
        try {
            const qty = parseInt(qtyInput.value) || 1;
            if (!window.walletManager) window.initWalletManager();
            const result = await window.walletManager.mintNFT(qty);
            if (result && result.transactionHash) {
                mintBtnText.textContent = 'Success!';
                mintBtnSpinner.style.display = 'none';
                mintBtn.classList.add('success');
                status.textContent = `NFT minted successfully!\nTx: ${result.transactionHash}`;
                status.style.color = '#22c55e';
                setTimeout(() => {
                    overlay.style.display = 'none';
                    mintBtn.disabled = true;
                    mintBtn.setAttribute('aria-busy', 'false');
                    mintBtnText.textContent = 'Mint NFT';
                    mintBtn.classList.remove('success');
                    qtyInput.value = 1;
                    updateTotal();
                }, 2200);
            } else {
                throw new Error('Mint failed');
            }
        } catch (error) {
            mintBtnText.textContent = 'Error!';
            mintBtnSpinner.style.display = 'none';
            mintBtn.classList.add('error');
            status.textContent = error.message || 'Mint failed.';
            status.style.color = '#ef4444';
            setTimeout(() => {
                mintBtn.disabled = false;
                mintBtn.setAttribute('aria-busy', 'false');
                mintBtnText.textContent = 'Mint NFT';
                mintBtn.classList.remove('error');
            }, 2500);
        }
    };

    // Close logic
    closeBtn.onclick = () => {
        overlay.style.display = 'none';
    };
}

// Attach popup logic to mint triggers
window.addEventListener('DOMContentLoaded', () => {
    const navMintBtn = document.getElementById('connectBuyBtn');
    if (navMintBtn) {
        navMintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showWalletMintCard();
        });
    }
    const modalMintBtn = document.getElementById('mint-action-btn');
    if (modalMintBtn) {
        modalMintBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showWalletMintCard();
        });
    }
});
