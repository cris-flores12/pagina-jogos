document.addEventListener('DOMContentLoaded', () => {
    console.log("Portal de Jogos iniciado com sucesso!");

  
    const welcomeMessage = "Bem-vindo ao GameZone JS!";
    const headerP = document.querySelector('header p');
    headerP.style.opacity = '0';
    headerP.style.transition = 'opacity 2s ease';
    
    setTimeout(() => {
        headerP.style.opacity = '1';
    }, 500);
});