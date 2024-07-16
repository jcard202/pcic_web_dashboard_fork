// src/routes/utils/graphs/traffic.ts
export default (dark: boolean) => {
	let trafficChannelsChartColors = { strokeColor: '#ffffff' };

	if (dark) {
		trafficChannelsChartColors = {
			strokeColor: '#1f2937'
		};
	} else {
		trafficChannelsChartColors = {
			strokeColor: '#ffffff'
		};
	}

	return {
		series: [70, 5, 25],
		labels: ['Desktop', 'Tablet', 'Phone'],
		colors: ['#16BDCA', '#FDBA8C', '#1A56DB'],
		chart: {
			type: 'donut',
			height: 400,
			fontFamily: 'Inter, sans-serif',
			toolbar: {
				show: false
			}
		},
		responsive: [
			{
				breakpoint: 430,
				options: {
					chart: {
						height: 300
					}
				}
			}
		],
		stroke: {
			colors: [trafficChannelsChartColors.strokeColor]
		},
		states: {
			hover: {
				filter: {
					type: 'darken',
					value: 0.9
				}
			}
		},
		tooltip: {
			shared: true,
			followCursor: false,
			fillSeriesColor: false,
			inverseOrder: true,
			style: {
				fontSize: '14px',
				fontFamily: 'Inter, sans-serif'
			},
			x: {
				show: true,
				formatter: function (_: unknown, { seriesIndex, w }: { seriesIndex: number; w: { config: { labels: string[] } } }): string {
					const label = w.config.labels[seriesIndex];
					return label;
				}
			},
			y: {
				formatter: function (value: number): string {
					return value + '%';
				}
			}
		},
		grid: {
			show: false
		},
		dataLabels: {
			enabled: false
		},
		legend: {
			show: false
		}
	};
};
