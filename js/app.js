// js/app.js

const csvPath = "assets/data/players.csv";

document.addEventListener("DOMContentLoaded", () => {
  d3.csv(csvPath).then(data => {
    console.log("Données chargées avec succès :", data.length, "joueurs.");

    // ==========================================
    // 1. ACTE 1 : SCATTER PLOT (Général vs Vitesse)
    // ==========================================
    const validData = data.filter(d => d.overall_rating && d.pace);

    const overall = validData.map(d => parseNumber(d.overall_rating));
    const pace = validData.map(d => parseNumber(d.pace));
    
    const playerNames = validData.map(d => {
      if (d.common_name && d.common_name.trim() !== "") return d.common_name;
      return `${d.first_name || ''} ${d.last_name || ''}`.trim() || "Joueur";
    });

    const clubs = validData.map(d => d.club || "Sans club");

    const trace1 = {
      x: overall,
      y: pace,
      text: playerNames,
      customdata: clubs,
      mode: 'markers',
      type: 'scatter',
      hovertemplate: 
        '<b>%{text}</b> (%{customdata})<br>' +
        'Général : <b>%{x}</b><br>' +
        'Vitesse : <b>%{y}</b><extra></extra>',
      marker: {
        size: 7,
        color: pace,
        colorscale: 'Viridis',
        opacity: 0.65
      }
    };

    const layout1 = {
      title: { 
        text: "L'Illusion du Général : Note Globale vs Vitesse", 
        font: { color: '#e6edf3', size: 16 } 
      },
      paper_bgcolor: '#161b22',
      plot_bgcolor: '#161b22',
      xaxis: { title: 'Note Globale (Overall)', color: '#8b949e', gridcolor: '#30363d' },
      yaxis: { title: 'Vitesse (Pace)', color: '#8b949e', gridcolor: '#30363d' },
      hoverlabel: { bgcolor: '#0d1117', bordercolor: '#30363d', font: { color: '#e6edf3' } },
      margin: { t: 50, r: 30, l: 50, b: 50 }
    };

    // Rendu si l'élément existe dans le DOM
    if (document.getElementById('chart-explosion')) {
      Plotly.newPlot('chart-explosion', [trace1], layout1, { responsive: true });
    }

    // ==========================================
    // 2. ACTE 2 : RADAR CHART (Star vs Pépite - Même Genre)
    // ==========================================
    // Filtrage strict : Hommes uniquement
    const mensData = data.filter(d => d.gender === "Men's Football");

    // Recherche d'une Star (ex: Mbappé - 91) et d'une Pépite Meta (ex: Carrasco - 82)
    const starMan = mensData.find(d => parseNumber(d.overall_rating) >= 90) || mensData[0];
    const pepiteMan = mensData.find(d => 
      parseNumber(d.overall_rating) <= 82 && 
      parseNumber(d.overall_rating) >= 78 && 
      parseNumber(d.pace) >= 88
    ) || mensData[10];

    // Rendu si l'élément existe dans le DOM
    if (document.getElementById('chart-radar') && starMan && pepiteMan) {
      renderRadarChart(starMan, pepiteMan);
    }

  }).catch(error => {
    console.error("Erreur lors du chargement du fichier CSV :", error);
  });
});

/**
 * Génère le Radar Chart comparatif entre deux joueurs du même genre
 * @param {Object} player1 - Objet joueur (Star)
 * @param {Object} player2 - Objet joueur (Pépite Meta)
 */
function renderRadarChart(player1, player2) {
  const categories = ['Vitesse', 'Tir', 'Passe', 'Dribble', 'Défense', 'Physique'];

  const getStats = (p) => [
    parseNumber(p.pace),
    parseNumber(p.shooting),
    parseNumber(p.passing),
    parseNumber(p.dribbling),
    parseNumber(p.defending),
    parseNumber(p.physicality)
  ];

  const getPlayerLabel = (p) => {
    const name = (p.common_name && p.common_name.trim() !== "") 
      ? p.common_name 
      : `${p.first_name || ''} ${p.last_name || ''}`.trim();
    return `${name} (${p.overall_rating})`;
  };

  const traceStar = {
    type: 'scatterpolar',
    r: getStats(player1),
    theta: categories,
    fill: 'toself',
    name: getPlayerLabel(player1),
    fillcolor: 'rgba(255, 75, 75, 0.3)',
    line: { color: '#ff4b4b' }
  };

  const tracePepite = {
    type: 'scatterpolar',
    r: getStats(player2),
    theta: categories,
    fill: 'toself',
    name: getPlayerLabel(player2),
    fillcolor: 'rgba(0, 255, 135, 0.3)',
    line: { color: '#00ff87' }
  };

  const layoutRadar = {
    paper_bgcolor: '#161b22',
    plot_bgcolor: '#161b22',
    polar: {
      bgcolor: '#0d1117',
      radialaxis: { 
        visible: true, 
        range: [0, 100], 
        color: '#8b949e', 
        gridcolor: '#30363d' 
      },
      angularaxis: { 
        color: '#e6edf3', 
        gridcolor: '#30363d' 
      }
    },
    legend: { 
      font: { color: '#e6edf3' }, 
      orientation: 'h', 
      y: -0.15 
    },
    margin: { t: 30, r: 40, l: 40, b: 50 }
  };

  Plotly.newPlot('chart-radar', [traceStar, tracePepite], layoutRadar, { responsive: true });
}