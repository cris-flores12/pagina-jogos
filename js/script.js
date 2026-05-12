// Aguarda o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log("Portal de Jogos iniciado com sucesso!");

    // Exemplo de manipulação do DOM: Adicionar um efeito de saudação no console
    const welcomeMessage = "Bem-vindo ao GameZone JS!";
    const headerP = document.querySelector('header p');
    
    // Pequena animação de entrada no texto de descrição
    headerP.style.opacity = '0';
    headerP.style.transition = 'opacity 2s ease';
    
    setTimeout(() => {
        headerP.style.opacity = '1';
    }, 500);
});