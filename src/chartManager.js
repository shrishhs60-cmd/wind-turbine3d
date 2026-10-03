/**
 * Chart Manager for Power Curve & Real-Time Operating Point
 * Uses Chart.js
 */

import Chart from 'chart.js/auto';

export class ChartManager {
  constructor(canvasId, physics) {
    this.canvas = document.getElementById(canvasId);
    this.physics = physics;
    this.chart = null;

    this.initChart();
  }

  initChart() {
    if (!this.canvas) return;

    const { windSpeeds, theoreticalPowers } = this.physics.getTheoreticalPowerCurveData();

    const ctx = this.canvas.getContext('2d');

    // Gradient fill under the power curve
    const gradient = ctx.createLinearGradient(0, 0, 0, 140);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.35)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 136, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: windSpeeds,
        datasets: [
          {
            label: 'Theoretical Power Curve (MW)',
            data: theoreticalPowers,
            borderColor: '#00f2fe',
            borderWidth: 2,
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: 'Operating Point',
            data: [{ x: this.physics.windSpeed, y: this.physics.powerMw }],
            borderColor: '#ffffff',
            backgroundColor: '#00ff88',
            pointRadius: 7,
            pointHoverRadius: 9,
            pointBorderWidth: 2,
            pointBorderColor: '#ffffff',
            showLine: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0, // Zero latency for real-time telemetry
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(10, 16, 28, 0.9)',
            titleColor: '#00f2fe',
            bodyColor: '#ffffff',
            borderColor: 'rgba(0, 242, 254, 0.3)',
            borderWidth: 1,
            callbacks: {
              label: (item) => `Power: ${item.formattedValue} MW`,
            },
          },
        },
        scales: {
          x: {
            type: 'linear',
            title: {
              display: true,
              text: 'Wind Speed (m/s)',
              color: '#8b9bb4',
              font: { size: 10, family: 'Inter' },
            },
            min: 0,
            max: 30,
            grid: {
              color: 'rgba(255, 255, 255, 0.06)',
            },
            ticks: {
              color: '#8b9bb4',
              font: { size: 9, family: 'JetBrains Mono' },
              stepSize: 5,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Power (MW)',
              color: '#8b9bb4',
              font: { size: 10, family: 'Inter' },
            },
            min: 0,
            max: 5.0,
            grid: {
              color: 'rgba(255, 255, 255, 0.06)',
            },
            ticks: {
              color: '#8b9bb4',
              font: { size: 9, family: 'JetBrains Mono' },
              stepSize: 1.0,
            },
          },
        },
      },
    });
  }

  /**
   * Update the live operating point on the power curve
   */
  updateOperatingPoint(windSpeed, powerMw) {
    if (!this.chart) return;
    this.chart.data.datasets[1].data = [{ x: windSpeed, y: powerMw }];
    this.chart.update('none');
  }
}
