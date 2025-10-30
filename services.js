    /* -------------------------------
      Calculator definitions & setup
    ---------------------------------*/
    const categories = {
      inv: {
        name: "Investment & Wealth",
        items: [
          { id: "compound", name: "Compound Interest Calculator", icon: "fa-chart-line" },
          { id: "sip", name: "SIP Calculator", icon: "fa-water" },
          { id: "lumpsum", name: "Lump Sum Investment Calculator", icon: "fa-coins" },
          { id: "retirement", name: "Retirement Corpus Calculator", icon: "fa-umbrella" },
          { id: "inflation", name: "Inflation Impact Calculator", icon: "fa-percent" },
        ]
      },
      loan: {
        name: "Loan & Credit",
        items: [
          { id: "emi", name: "EMI Calculator", icon: "fa-calculator" },
          { id: "amort", name: "Loan Repayment Schedule (Amortization)", icon: "fa-file-invoice-dollar" },
        ]
      },
      personal: {
        name: "Personal Finance",
        items: [
          { id: "networth", name: "Net Worth Tracker", icon: "fa-layer-group" },
        ]
      }
    };

    const allCalculators = {}; // will store render & compute functions per id

    /* -------------------------------
      Implement calculators (kept working)
      (Same logic as provided, but we keep only fully implemented tools)
    ---------------------------------*/
    function money(v) { return '₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
    function numberOrZero(v) { return (v === '' || v === undefined || isNaN(Number(v))) ? 0 : Number(v); }

    /* Compound Interest */
    allCalculators.compound = { /* same as original implementation */
      name: 'Compound Interest Calculator',
      desc: 'Future value for principal compounded annually or by frequency.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Principal (₹)</label><input id="c_principal" type="number" placeholder="e.g. 10000" />
      <label>Annual Rate (%)</label><input id="c_rate" type="number" placeholder="e.g. 8" />
      <label>Years</label><input id="c_years" type="number" placeholder="e.g. 5" />
      <label>Compounds per year</label>
      <select id="c_n"><option value="1">Annually</option><option value="2">Semi-Annually</option><option value="4">Quarterly</option><option value="12">Monthly</option></select>
      <div class="actions"><button class="btn btn-primary" id="c_calc">Calculate</button><button class="btn btn-ghost" id="c_reset">Reset</button></div>
      <div style="margin-top:12px" id="c_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#c_calc').addEventListener('click', () => {
            const P = numberOrZero(wrap.querySelector('#c_principal').value);
            const r = numberOrZero(wrap.querySelector('#c_rate').value) / 100;
            const t = numberOrZero(wrap.querySelector('#c_years').value);
            const n = Number(wrap.querySelector('#c_n').value);
            if (!P || !t) { wrap.querySelector('#c_out').innerHTML = '<div class="muted">Enter principal & years</div>'; return; }
            const FV = P * Math.pow(1 + r / n, n * t);
            wrap.querySelector('#c_out').innerHTML = `<div class="result-plate"><div class="muted">Future Value</div><div class="value">${money(FV)}</div></div>`;
            const labels = []; const data = [];
            for (let y = 0; y <= t; y++) { labels.push(y); data.push(+(P * Math.pow(1 + r / n, n * y)).toFixed(2)); }
            updateChart(labels, data, 'Compound Growth');
            resultValue.textContent = money(FV);
          });
          wrap.querySelector('#c_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#c_out').innerHTML = ''; updateChart([], [], 'Value'); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      },
      defaultChart: function () {
        const P = 10000, r = 0.08, n = 12, t = 10;
        const labels = [], data = [];
        for (let y = 0; y <= t; y++) { labels.push(y); data.push(+(P * Math.pow(1 + r / n, n * y)).toFixed(2)); }
        updateChart(labels, data, 'Compound (demo)');
        resultValue.textContent = money(data[data.length - 1]);
      }
    };

    /* SIP Calculator */
    allCalculators.sip = {
      name: 'SIP Calculator',
      desc: 'Monthly SIP contributions growing at expected annual return.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Monthly SIP Amount (₹)</label><input id="s_amt" type="number" placeholder="e.g. 5000" />
      <label>Expected Annual Return (%)</label><input id="s_rate" type="number" placeholder="e.g. 12" />
      <label>Investment Tenure (years)</label><input id="s_years" type="number" placeholder="e.g. 10" />
      <div class="actions"><button class="btn btn-primary" id="s_calc">Calculate</button><button class="btn btn-ghost" id="s_reset">Reset</button></div>
      <div style="margin-top:12px" id="s_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#s_calc').addEventListener('click', () => {
            const m = numberOrZero(wrap.querySelector('#s_amt').value);
            const r = numberOrZero(wrap.querySelector('#s_rate').value) / 100;
            const y = numberOrZero(wrap.querySelector('#s_years').value);
            if (!m || !y) { wrap.querySelector('#s_out').innerHTML = '<div class="muted">Enter monthly amount & years</div>'; return; }
            const n = 12;
            const ratePer = r / n;
            const months = y * 12;
            let fv = 0;
            const labels = []; const data = [];
            for (let i = 1; i <= months; i++) {
              fv = (fv + m) * (1 + ratePer);
              if (i % 12 === 0) { labels.push(i / 12); data.push(+fv.toFixed(2)); }
            }
            wrap.querySelector('#s_out').innerHTML = `<div class="result-plate"><div class="muted">Future Value</div><div class="value">${money(fv)}</div></div>`;
            updateChart(labels, data, 'SIP Growth');
            resultValue.textContent = money(fv);
          });
          wrap.querySelector('#s_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#s_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* Lump Sum */
    allCalculators.lumpsum = {
      name: 'Lump Sum Investment Calculator',
      desc: 'One-time investment future value.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Investment Amount (₹)</label><input id="ls_amt" type="number" placeholder="e.g. 50000" />
      <label>Annual Return (%)</label><input id="ls_rate" type="number" placeholder="e.g. 10" />
      <label>Years</label><input id="ls_years" type="number" placeholder="e.g. 5" />
      <div class="actions"><button class="btn btn-primary" id="ls_calc">Calculate</button><button class="btn btn-ghost" id="ls_reset">Reset</button></div>
      <div style="margin-top:12px" id="ls_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#ls_calc').addEventListener('click', () => {
            const P = numberOrZero(wrap.querySelector('#ls_amt').value);
            const r = numberOrZero(wrap.querySelector('#ls_rate').value) / 100;
            const t = numberOrZero(wrap.querySelector('#ls_years').value);
            if (!P || !t) { wrap.querySelector('#ls_out').innerHTML = '<div class="muted">Enter amount & years</div>'; return; }
            const FV = P * Math.pow(1 + r, t);
            wrap.querySelector('#ls_out').innerHTML = `<div class="result-plate"><div class="muted">Future Value</div><div class="value">${money(FV)}</div></div>`;
            const labels = [], data = [];
            for (let y = 0; y <= t; y++) { labels.push(y); data.push(+(P * Math.pow(1 + r, y)).toFixed(2)); }
            updateChart(labels, data, 'Lump Sum Growth');
            resultValue.textContent = money(FV);
          });
          wrap.querySelector('#ls_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#ls_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* EMI Calculator */
    allCalculators.emi = {
      name: 'EMI Calculator',
      desc: 'Calculate monthly EMI for loans.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Loan Amount (₹)</label><input id="e_principal" type="number" />
      <label>Annual Interest Rate (%)</label><input id="e_rate" type="number" />
      <label>Tenure (years)</label><input id="e_years" type="number" />
      <div class="actions"><button class="btn btn-primary" id="e_calc">Calculate EMI</button><button class="btn btn-ghost" id="e_reset">Reset</button></div>
      <div style="margin-top:12px" id="e_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#e_calc').addEventListener('click', () => {
            const P = numberOrZero(wrap.querySelector('#e_principal').value);
            const annual = numberOrZero(wrap.querySelector('#e_rate').value);
            const yrs = numberOrZero(wrap.querySelector('#e_years').value);
            if (!P || !yrs) { wrap.querySelector('#e_out').innerHTML = '<div class="muted">Enter loan amount & tenure</div>'; return; }
            const n = yrs * 12; const r = annual / 12 / 100;
            const EMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            const total = EMI * n; const interest = total - P;
            wrap.querySelector('#e_out').innerHTML = `<div class="result-plate"><div class="muted">Monthly EMI</div><div class="value">${money(EMI)}</div><div class="muted" style="margin-top:8px">Total Payment ${money(total)} • Interest ${money(interest)}</div></div>`;
            const labels = []; const data = []; let bal = P;
            for (let m = 1; m <= n; m++) {
              const interestPort = bal * r;
              const principalPort = EMI - interestPort;
              bal -= principalPort;
              if (m % 12 === 0) { labels.push(m / 12); data.push(Math.max(0, +bal.toFixed(2))); }
            }
            updateChart(labels, data, 'Outstanding Balance');
            resultValue.textContent = money(EMI);
          });
          wrap.querySelector('#e_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#e_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* Amortization schedule (detailed) */
    allCalculators.amort = {
      name: 'Loan Repayment Schedule (Amortization)',
      desc: 'Detailed payment schedule (monthly principal & interest).',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Loan Amount (₹)</label><input id="a_principal" type="number" />
      <label>Annual Interest Rate (%)</label><input id="a_rate" type="number" />
      <label>Tenure (years)</label><input id="a_years" type="number" />
      <div class="actions"><button class="btn btn-primary" id="a_calc">Show Schedule</button><button class="btn btn-ghost" id="a_reset">Reset</button></div>
      <div style="margin-top:12px" id="a_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#a_calc').addEventListener('click', () => {
            const P = numberOrZero(wrap.querySelector('#a_principal').value);
            const annual = numberOrZero(wrap.querySelector('#a_rate').value);
            const yrs = numberOrZero(wrap.querySelector('#a_years').value);
            if (!P || !yrs) { wrap.querySelector('#a_out').innerHTML = '<div class="muted">Enter loan & tenure</div>'; return; }
            const n = yrs * 12; const r = annual / 12 / 100;
            const EMI = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            let bal = P; const rows = [];
            for (let m = 1; m <= n; m++) {
              const interest = bal * r;
              const principal = EMI - interest;
              bal -= principal;
              rows.push({ month: m, interest: +interest.toFixed(2), principal: +principal.toFixed(2), balance: Math.max(0, +bal.toFixed(2)) });
            }
            let html = `<div class="result-plate"><div class="muted">Monthly EMI</div><div class="value">${money(EMI)}</div></div>`;
            html += `<div style="margin-top:12px;max-height:260px;overflow:auto;border-radius:10px;border:1px solid #eef6ff;padding:8px"><table style="width:100%;border-collapse:collapse"><thead><tr style="font-size:12px;color:var(--muted)"><th style="text-align:left">M</th><th style="text-align:right">Principal</th><th style="text-align:right">Interest</th><th style="text-align:right">Balance</th></tr></thead><tbody>`;
            rows.forEach(rw => html += `<tr style="font-size:13px"><td>${rw.month}</td><td style="text-align:right">${money(rw.principal)}</td><td style="text-align:right">${money(rw.interest)}</td><td style="text-align:right">${money(rw.balance)}</td></tr>`);
            html += `</tbody></table></div>`;
            wrap.querySelector('#a_out').innerHTML = html;
            const labels = [], data = [];
            for (let i = 0; i < rows.length; i++) {
              if ((i + 1) % 12 === 0) { labels.push((i + 1) / 12); data.push(rows[i].balance); }
            }
            updateChart(labels, data, 'Outstanding');
            resultValue.textContent = money(rows[rows.length - 1].balance || 0);
          });
          wrap.querySelector('#a_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#a_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* Retirement Corpus */
    allCalculators.retirement = {
      name: 'Retirement Corpus Calculator',
      desc: 'Estimate corpus required at retirement given desired monthly income.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Current Age</label><input id="r_age" type="number" />
      <label>Retirement Age</label><input id="r_ret" type="number" />
      <label>Desired Monthly Income at Retirement (₹)</label><input id="r_income" type="number" />
      <label>Expected Annual Return (%) during retirement</label><input id="r_return" type="number" placeholder="e.g. 6" />
      <label>Estimated Years in Retirement</label><input id="r_years" type="number" value="20" />
      <div class="actions"><button class="btn btn-primary" id="r_calc">Estimate Corpus</button><button class="btn btn-ghost" id="r_reset">Reset</button></div>
      <div style="margin-top:12px" id="r_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#r_calc').addEventListener('click', () => {
            const age = numberOrZero(wrap.querySelector('#r_age').value);
            const ret = numberOrZero(wrap.querySelector('#r_ret').value);
            const monthly = numberOrZero(wrap.querySelector('#r_income').value);
            const annReturn = numberOrZero(wrap.querySelector('#r_return').value) / 100;
            const years = numberOrZero(wrap.querySelector('#r_years').value);
            if (!ret || !monthly || ret <= age) { wrap.querySelector('#r_out').innerHTML = '<div class="muted">Enter valid ages & income</div>'; return; }
            const r = annReturn / 12 || 0.005; // avoid divide by zero, default small return
            const n = years * 12;
            const corpus = monthly * ((1 - Math.pow(1 + r, -n)) / r);
            wrap.querySelector('#r_out').innerHTML = `<div class="result-plate"><div class="muted">Estimated Retirement Corpus</div><div class="value">${money(corpus)}</div><div class="muted" style="margin-top:8px">Assumes monthly withdrawal ${money(monthly)}</div></div>`;
            const labels = [0, 5, 10, 15, 20]; const data = labels.map((x, i) => +((corpus * (i + 1) / labels.length)).toFixed(2));
            updateChart(labels, data, 'Corpus Build (demo)');
            resultValue.textContent = money(corpus);
          });
          wrap.querySelector('#r_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#r_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* Inflation Impact */
    allCalculators.inflation = {
      name: 'Inflation Impact Calculator',
      desc: 'See how inflation reduces future purchasing power.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Today's Amount (₹)</label><input id="i_amount" type="number" />
      <label>Annual Inflation Rate (%)</label><input id="i_rate" type="number" />
      <label>Years</label><input id="i_years" type="number" />
      <div class="actions"><button class="btn btn-primary" id="i_calc">Calculate</button><button class="btn btn-ghost" id="i_reset">Reset</button></div>
      <div style="margin-top:12px" id="i_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#i_calc').addEventListener('click', () => {
            const A = numberOrZero(wrap.querySelector('#i_amount').value);
            const r = numberOrZero(wrap.querySelector('#i_rate').value) / 100;
            const t = numberOrZero(wrap.querySelector('#i_years').value);
            if (!A || !t) { wrap.querySelector('#i_out').innerHTML = '<div class="muted">Enter amount & years</div>'; return; }
            const future = A / Math.pow(1 + r, t);
            wrap.querySelector('#i_out').innerHTML = `<div class="result-plate"><div class="muted">Equivalent Purchasing Power Today</div><div class="value">${money(future)}</div></div>`;
            const labels = [], data = [];
            for (let y = 0; y <= t; y++) { labels.push(y); data.push(+(A / Math.pow(1 + r, y)).toFixed(2)); }
            updateChart(labels, data, 'Inflation Impact');
            resultValue.textContent = money(future);
          });
          wrap.querySelector('#i_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#i_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* Net Worth Tracker */
    allCalculators.networth = {
      name: 'Net Worth Tracker',
      desc: 'Quick assets minus liabilities snapshot.',
      render: function () {
        const wrap = document.createElement('div'); wrap.className = 'calc-card';
        wrap.innerHTML = `
      <label>Assets (total ₹)</label><input id="nw_assets" type="number" />
      <label>Liabilities (total ₹)</label><input id="nw_liab" type="number" />
      <div class="actions"><button class="btn btn-primary" id="nw_calc">Calculate Net Worth</button><button class="btn btn-ghost" id="nw_reset">Reset</button></div>
      <div style="margin-top:12px" id="nw_out"></div>
    `;
        setTimeout(() => {
          wrap.querySelector('#nw_calc').addEventListener('click', () => {
            const a = numberOrZero(wrap.querySelector('#nw_assets').value);
            const l = numberOrZero(wrap.querySelector('#nw_liab').value);
            const nw = a - l;
            wrap.querySelector('#nw_out').innerHTML = `<div class="result-plate"><div class="muted">Net Worth</div><div class="value">${money(nw)}</div></div>`;
            updateChart(['Liabilities', 'Net Worth'], [l, nw], 'Net Worth Snapshot');
            resultValue.textContent = money(nw);
          });
          wrap.querySelector('#nw_reset').addEventListener('click', () => { wrap.querySelectorAll('input').forEach(i => i.value = ''); wrap.querySelector('#nw_out').innerHTML = ''; updateChart([], []); resultValue.textContent = 'Reset'; });
        }, 0);
        return wrap;
      }
    };

    /* -------------------------------
      Populate sidebar (only items implemented)
    ---------------------------------*/
    function createSidebar() {
      for (const key of Object.keys(categories)) {
        const wrapper = document.getElementById('cat-' + key);
        wrapper.innerHTML = '';
        categories[key].items.forEach(item => {
          if (!allCalculators[item.id]) return; // skip if not implemented
          const el = document.createElement('div');
          el.className = 'calc-item';
          el.dataset.id = item.id;
          el.innerHTML = `<i class="fa ${item.icon}"></i><div style="flex:1"><div class="calc-name">${item.name}</div><div class="calc-sub">${categories[key].name}</div></div><div style="opacity:0.6"><i class="fa fa-chevron-right"></i></div>`;
          el.addEventListener('click', () => selectCalculator(item.id));
          wrapper.appendChild(el);
        });
      }
    }
    createSidebar();

    /* -------------------------------
      Chart: default & update
    ---------------------------------*/
    const ctx = document.getElementById('growthChart').getContext('2d');
    let chart = new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label: 'Value', data: [], tension: 0.35, fill: true, backgroundColor: 'rgba(30,144,255,0.08)', borderColor: '#1e90ff', pointRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index' } },
        scales: { x: { title: { display: true, text: 'Years' } }, y: { title: { display: true, text: 'Value (₹)' } } }
      }
    });

    function updateChart(labels, data, labelName = 'Value') {
      chart.data.labels = labels;
      chart.data.datasets[0].data = data;
      chart.data.datasets[0].label = labelName;
      chart.update();
    }

    /* -------------------------------
      Render area & selection
    ---------------------------------*/
    const leftCol = document.getElementById('leftCol');
    const resultTitle = document.getElementById('resultTitle');
    const resultValue = document.getElementById('resultValue');
    const resultSub = document.getElementById('resultSub');
    let activeId = null;

    function clearActive() { document.querySelectorAll('.calc-item').forEach(el => el.classList.remove('active')); }

    function selectCalculator(id) {
      activeId = id;
      clearActive();
      document.querySelectorAll('.calc-item').forEach(el => { if (el.dataset.id === id) el.classList.add('active'); });
      leftCol.innerHTML = '';
      if (allCalculators[id] && allCalculators[id].render) {
        leftCol.appendChild(allCalculators[id].render());
        resultTitle.textContent = allCalculators[id].name;
        resultSub.textContent = allCalculators[id].desc || '';
        if (allCalculators[id].defaultChart) allCalculators[id].defaultChart(); else { updateChart([], [], 'Value'); resultValue.textContent = 'Ready'; }
      } else {
        leftCol.innerHTML = `<div class="calc-card"><h3>Coming soon</h3><p class="muted">This calculator will be added soon.</p></div>`;
        resultTitle.textContent = 'Coming soon'; resultValue.textContent = ''; resultSub.textContent = ''; updateChart([], [], 'Value');
      }
    }

    /* -------------------------------
      Initial demo: default chart & opening
    ---------------------------------*/
    function showDefault() {
      resultTitle.textContent = 'Growth Demo';
      resultValue.textContent = 'Interactive charts';
      resultSub.textContent = 'Select a calculator to see inputs, outputs & charts';
      const labels = Array.from({ length: 11 }, (_, i) => i);
      const data = labels.map((y) => Math.round(10000 * Math.pow(1.08, y)));
      updateChart(labels, data, 'Demo Growth (8% p.a.)');
    }
    showDefault();

    /* -------------------------------
      Category toggle & UI helpers
    ---------------------------------*/
    function toggleCategory(key) {
      const el = document.getElementById('cat-' + key);
      el.style.display = el.style.display === 'none' ? 'block' : 'none';
    }

    /* -------------------------------
      Misc actions: Reset & download CSV
    ---------------------------------*/
    document.getElementById('resetAll').addEventListener('click', () => {
      leftCol.innerHTML = `<div class="calc-card"><h3>Pick a calculator</h3><p class="muted">Choose a tool from the left to get started.</p></div>`;
      clearActive();
      showDefault();
    });

    document.getElementById('downloadCsv').addEventListener('click', () => {
      const labels = chart.data.labels || [];
      const data = chart.data.datasets[0].data || [];
      if (!labels.length) { alert('No chart data to download'); return; }
      let csv = 'label,value\n';
      for (let i = 0; i < labels.length; i++) { csv += `${labels[i]},${data[i]}\n`; }
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'chart-data.csv'; a.click();
      URL.revokeObjectURL(url);
    });

    /* -------------------------------
      Auto-select first implemented item
    ---------------------------------*/
    (function autoSelectFirst() {
      setTimeout(() => {
        // find first available implemented id in categories order
        for (const k of Object.keys(categories)) {
          for (const item of categories[k].items) { if (allCalculators[item.id]) { selectCalculator(item.id); return; } }
        }
      }, 300);
    })();
  