let infoData = JSON.parse(localStorage.getItem("data")) || [];

window.addEventListener('resize', renderChart);

$(document).ready(function () {


  fetch('assets/pages/componentes/modal-formIngresos.html')
    .then(res => res.text())
    .then(html => {
      $('#modalIngresosContainer').html(html);
    });

  fetch('assets/pages/componentes/modal-formGastos.html')
    .then(res => res.text())
    .then(html => {
      $('#modalGastosContainer').html(html);
    });


$(document).on('submit', '#incomeForm', function (e) {
  e.preventDefault();

  console.log('FORM INGRESO ENVIADO');

  const concepto = $('#incomeDesc').val();
  const monto = Number($('#incomeAmount').val());

  if (!concepto || monto <= 0) return;

  infoData.push({
    concepto,
    monto,
    tipo: 'Ingreso'
  });

  localStorage.setItem('data', JSON.stringify(infoData));

  $('#incomeModal').modal('hide');
  this.reset(); 

  actualizarResumen();
});

$(document).on('submit', '#expenseForm', function (e) {
  e.preventDefault(); 

  console.log('FORM GASTO ENVIADO');

  const concepto = $('#expenseDesc').val();
  const monto = Number($('#expenseAmount').val());

  if (!concepto || monto <= 0) return;

  infoData.push({
    concepto,
    monto,
    tipo: 'Gasto'
  });

  localStorage.setItem('data', JSON.stringify(infoData));

  $('#expenseModal').modal('hide');
  this.reset(); 

  actualizarResumen();
});

  actualizarResumen();
  renderMovimientos();
  renderChart();
});


const sidebar = document.getElementById('actionSidebar');
const openBtn = document.getElementById('openActions');
const closeBtn = document.getElementById('closeActions');

openBtn.addEventListener('click', () => {
  sidebar.classList.add('action-sidebar--active');
});

closeBtn.addEventListener('click', () => {
  sidebar.classList.remove('action-sidebar--active');
});


function openIncome() {
  $('#incomeModal').modal('show');
}

function openExpense() {
  $('#expenseModal').modal('show');
}

function actualizarResumen() {
  const totalIngresos = infoData
    .filter(i => i.tipo === 'Ingreso')
    .reduce((acc, i) => acc + i.monto, 0);

  const totalGastos = infoData
    .filter(i => i.tipo === 'Gasto')
    .reduce((acc, i) => acc + i.monto, 0);

  const saldo = totalIngresos - totalGastos;

  $('.summary-card--income .summary-card__amount').text(`$${totalIngresos.toLocaleString()}`);
  $('.summary-card--expense .summary-card__amount').text(`$${totalGastos.toLocaleString()}`);
  $('.summary-card--balance .summary-card__amount').text(`$${saldo.toLocaleString()}`);
}

function renderMovimientos() {
  const list = $('#movementList');
  list.empty(); 

  const movimientos = [...infoData].reverse();

  movimientos.forEach(mov => {
    const isIngreso = mov.tipo === 'Ingreso';

    const clase = isIngreso
      ? 'movement-list__item--income'
      : 'movement-list__item--expense';

    const signo = isIngreso ? '+' : '-';

    const item = `
      <li class="movement-list__item ${clase}">
        <span>${mov.concepto}</span>
        <span>${signo}$${mov.monto.toLocaleString('es-CL')}</span>
      </li>
    `;

    list.append(item);
  });
}

function getChartData() {
  const ingresos = infoData
    .filter(i => i.tipo === 'Ingreso')
    .reduce((acc, i) => acc + i.monto, 0);

  const gastos = infoData
    .filter(i => i.tipo === 'Gasto')
    .reduce((acc, i) => acc + i.monto, 0);

  return { ingresos, gastos };
}

let chartInstance = null;

function renderChart() {
  const ctx = document.getElementById('financeChart').getContext('2d');
  const { ingresos, gastos } = getChartData();
  const isMobile = window.innerWidth < 768;

  if (chartInstance) {
    chartInstance.destroy();
  }

  if (isMobile) {
    // 📱 GRÁFICO DE TORTA
    chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          data: [ingresos, gastos],
          backgroundColor: ['#28a745', '#dc3545']
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

  } else {
    // 🖥️ GRÁFICO DE BARRAS
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Ingresos', 'Gastos'],
        datasets: [{
          label: 'Monto ($)',
          data: [ingresos, gastos],
          backgroundColor: ['#28a745', '#dc3545']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `$${ctx.raw.toLocaleString('es-CL')}`
            }
          }
        },
        scales: {
          y: {
            ticks: {
              callback: value => `$${value.toLocaleString('es-CL')}`
            }
          }
        }
      }
    });
  }
}

