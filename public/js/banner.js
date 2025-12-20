const oldDomain = 'cko.jeff94040.ddns.net';
if (window.location.hostname === oldDomain) {
  const banner = document.createElement('div');
  banner.style.backgroundColor = '#ffcc00';
  banner.style.color = '#000';
  banner.style.padding = '10px';
  banner.style.textAlign = 'center';
  banner.style.fontWeight = 'bold';
  banner.innerHTML = `This domain will be retired. Update your bookmark to <a href="https://cko.jeff94040.com">cko.jeff94040.com</a>.`;
  document.body.prepend(banner);
}