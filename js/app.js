// js/app.js

// Chemin vers ton fichier CSV
const csvPath = "assets/data/players.csv";

d3.csv(csvPath).then(data => {
  console.log("Nombre de joueurs chargés :", data.length);

  // 1. Filtrer pour ne garder que les joueurs avec des stats valides
  const validData = data.filter(d => d.overall_rating && d.pace);

  // 2. Extraire les colonnes nécessaires
  const overall = validData.map(d => parseNumber(d.overall_rating));
  const pace = validData.map(d => parseNumber(d.pace));
  
  // Nom d'affichage du joueur (common_name ou prénom + nom)
  const playerNames = validData.map(d => {
    if (d.common_name && d.common_name.trim() !== "") return d.common_name;
    return `${d.first_name || ''} ${d.last_name || ''}`.trim() || "Joueur";
  });

  const clubs = validData.map(d => d.club || "Sans club");

  // 3. Configuration des données pour Plotly
  const trace = {
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

  // 4. Configuration du layout (Style sombre)
  const layout = {
    title: {
      text: "L'Illusion du Général : Note Globale vs Vitesse (Pace)",
      font: { color: '#e6edf3', size: 18 }
    },
    paper_bgcolor: '#161b22',
    plot_bgcolor: '#161b22',
    xaxis: {
      title: 'Note Globale (Overall Rating)',
      color: '#8b949e',
      gridcolor: '#30363d',
      zerolinecolor: '#30363d'
    },
    yaxis: {
      title: 'Vitesse (Pace)',
      color: '#8b949e',
      gridcolor: '#30363d',
      zerolinecolor: '#30363d'
    },
    hoverlabel: {
      bgcolor: '#0d1117',
      bordercolor: '#30363d',
      font: { color: '#e6edf3' }
    },
    margin: { t: 60, r: 30, l: 50, b: 50 }
  };

  // 5. Rendu dans le div HTML
  Plotly.newPlot('chart-explosion', [trace], layout, { responsive: true });

}).catch(error => {
  console.error("Erreur lors du chargement du fichier CSV :", error);
});