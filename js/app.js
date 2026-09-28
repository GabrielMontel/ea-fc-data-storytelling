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

    if (document.getElementById('chart-explosion')) {
      Plotly.newPlot('chart-explosion', [trace1], layout1, { responsive: true });
    }

    // ==========================================
    // 2. ACTE 2 : RADAR CHART (Star vs Pépite - Même Genre)
    // ==========================================
    const mensData = data.filter(d => d.gender === "Men's Football");

    const starMan = mensData.find(d => parseNumber(d.overall_rating) >= 90) || mensData[0];
    const pepiteMan = mensData.find(d => 
      parseNumber(d.overall_rating) <= 82 && 
      parseNumber(d.overall_rating) >= 78 && 
      parseNumber(d.pace) >= 88
    ) || mensData[10];

    if (document.getElementById('chart-radar') && starMan && pepiteMan) {
      renderRadarChart(starMan, pepiteMan);
    }

    // ==========================================
    // 3. ACTE 3 : SMART SCOUT (MULTICRITÈRES + CARTE FUT)
    // ==========================================
    const scoutContainer = document.getElementById('chart-scout');

    if (scoutContainer) {
      // Éléments HTML des filtres
      const inputGender = document.getElementById('filter-gender');
      const inputOverall = document.getElementById('filter-overall');
      const inputPace = document.getElementById('filter-pace');
      const inputShooting = document.getElementById('filter-shooting');
      const inputPassing = document.getElementById('filter-passing');
      const inputDribbling = document.getElementById('filter-dribbling');
      const inputDefending = document.getElementById('filter-defending');
      const inputPhysicality = document.getElementById('filter-physicality');

      // Labels des filtres
      const labelOverall = document.getElementById('val-overall');
      const labelPace = document.getElementById('val-pace');
      const labelShooting = document.getElementById('val-shooting');
      const labelPassing = document.getElementById('val-passing');
      const labelDribbling = document.getElementById('val-dribbling');
      const labelDefending = document.getElementById('val-defending');
      const labelPhysicality = document.getElementById('val-physicality');

      // Mise à jour de la carte FUT HTML
      function renderFutCard(player) {
        if (!player) {
          document.getElementById('card-name').textContent = "Aucun joueur";
          document.getElementById('card-overall').textContent = "--";
          document.getElementById('card-pos-club').textContent = "N/A";
          document.getElementById('card-pac').textContent = "--";
          document.getElementById('card-sho').textContent = "--";
          document.getElementById('card-pas').textContent = "--";
          document.getElementById('card-dri').textContent = "--";
          document.getElementById('card-def').textContent = "--";
          document.getElementById('card-phy').textContent = "--";
          return;
        }

        const name = (player.common_name && player.common_name.trim() !== "") 
          ? player.common_name 
          : `${player.first_name || ''} ${player.last_name || ''}`.trim() || "Joueur";

        document.getElementById('card-name').textContent = name;
        document.getElementById('card-overall').textContent = player.overall_rating || "--";
        document.getElementById('card-pos-club').textContent = `${player.position || 'N/A'} · ${player.club || 'Sans club'}`;
        document.getElementById('card-pac').textContent = parseNumber(player.pace);
        document.getElementById('card-sho').textContent = parseNumber(player.shooting);
        document.getElementById('card-pas').textContent = parseNumber(player.passing);
        document.getElementById('card-dri').textContent = parseNumber(player.dribbling);
        document.getElementById('card-def').textContent = parseNumber(player.defending);
        document.getElementById('card-phy').textContent = parseNumber(player.physicality);
      }

      function updateScoutChart() {
        const selectedGender = inputGender.value;
        const maxOverall = parseNumber(inputOverall.value);
        const minPace = parseNumber(inputPace.value);
        const minShooting = parseNumber(inputShooting.value);
        const minPassing = parseNumber(inputPassing.value);
        const minDribbling = parseNumber(inputDribbling.value);
        const minDefending = parseNumber(inputDefending.value);
        const minPhysicality = parseNumber(inputPhysicality.value);

        if (labelOverall) labelOverall.textContent = maxOverall;
        if (labelPace) labelPace.textContent = minPace;
        if (labelShooting) labelShooting.textContent = minShooting;
        if (labelPassing) labelPassing.textContent = minPassing;
        if (labelDribbling) labelDribbling.textContent = minDribbling;
        if (labelDefending) labelDefending.textContent = minDefending;
        if (labelPhysicality) labelPhysicality.textContent = minPhysicality;

        // Filtrage dynamique selon tous les critères
        const filtered = data.filter(d => 
          d.gender === selectedGender &&
          parseNumber(d.overall_rating) <= maxOverall &&
          parseNumber(d.pace) >= minPace &&
          parseNumber(d.shooting) >= minShooting &&
          parseNumber(d.passing) >= minPassing &&
          parseNumber(d.dribbling) >= minDribbling &&
          parseNumber(d.defending) >= minDefending &&
          parseNumber(d.physicality) >= minPhysicality
        );

        // Affiche la carte du premier joueur correspondant
        renderFutCard(filtered.length > 0 ? filtered[0] : null);

        const xOverall = filtered.map(d => parseNumber(d.overall_rating));
        const yPace = filtered.map(d => parseNumber(d.pace));
        const names = filtered.map(d => {
          if (d.common_name && d.common_name.trim() !== "") return d.common_name;
          return `${d.first_name || ''} ${d.last_name || ''}`.trim() || "Joueur";
        });

        const traceScout = {
          x: xOverall,
          y: yPace,
          text: names,
          customdata: filtered,
          mode: 'markers',
          type: 'scatter',
          hovertemplate: '<b>%{text}</b><br>Général : %{x} | Vitesse : %{y}<extra></extra>',
          marker: {
            size: 10,
            color: filtered.map(d => parseNumber(d.dribbling)),
            colorscale: 'Viridis',
            showscale: true,
            colorbar: { title: { text: 'Dribble', font: { color: '#e6edf3' } }, tickfont: { color: '#e6edf3' } },
            opacity: 0.85
          }
        };

        const layoutScout = {
          title: { text: `Pépites correspondant à tes critères : ${filtered.length}`, font: { color: '#00ff87', size: 16 } },
          paper_bgcolor: '#161b22',
          plot_bgcolor: '#161b22',
          xaxis: { title: 'Note Globale Max', color: '#8b949e', gridcolor: '#30363d' },
          yaxis: { title: 'Vitesse Min', color: '#8b949e', gridcolor: '#30363d' },
          margin: { t: 50, r: 30, l: 50, b: 50 }
        };

        Plotly.newPlot('chart-scout', [traceScout], layoutScout, { responsive: true }).then(() => {
          scoutContainer.on('plotly_hover', function(dataHover) {
            if (dataHover && dataHover.points && dataHover.points.length > 0) {
              const selectedPlayer = dataHover.points[0].customdata;
              renderFutCard(selectedPlayer);
            }
          });
        });
      }

      // Écoute des changements sur l'ensemble des filtres
      const inputs = [
        inputGender, inputOverall, inputPace, inputShooting, 
        inputPassing, inputDribbling, inputDefending, inputPhysicality
      ];

      inputs.forEach(input => {
        if (input) {
          input.addEventListener('input', updateScoutChart);
          input.addEventListener('change', updateScoutChart);
        }
      });

      updateScoutChart();
    }

  }).catch(error => {
    console.error("Erreur lors du chargement du fichier CSV :", error);
  });
});

/**
 * Fonction de rendu du Radar Chart (Acte 2)
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
      radialaxis: { visible: true, range: [0, 100], color: '#8b949e', gridcolor: '#30363d' },
      angularaxis: { color: '#e6edf3', gridcolor: '#30363d' }
    },
    legend: { font: { color: '#e6edf3' }, orientation: 'h', y: -0.15 },
    margin: { t: 30, r: 40, l: 40, b: 50 }
  };

  Plotly.newPlot('chart-radar', [traceStar, tracePepite], layoutRadar, { responsive: true });
}