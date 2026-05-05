function enviarWhats(event) {
  event.preventDefault();

  const nome = document.getElementById("nome").value;
  const telefone = document.getElementById("telefone").value;

  const msg = `Olá! Me chamo ${nome} e tenho interesse no COSAOGE. Meu número: ${telefone}`;

  const url = `https://wa.me/5551991627975?text=${encodeURIComponent(msg)}`;

  window.open(url, '_blank');
}