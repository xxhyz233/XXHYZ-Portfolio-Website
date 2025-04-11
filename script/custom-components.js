// Header template
const headerTemplate = document.createElement("template");
headerTemplate.innerHTML = `
<header class="desktop-head sticky">
    <nav>
        <img class="signatureHead scAni" src="../media/images/signature.png"/>
        <ul class="menu">
            <li class="scAni"><a class="c1" href="../pages/index.html">FILM</a></li>
            <li class="scAni"><a class="c2" href="../pages/3dcg.html">3D/CG</a></li>
            <li class="scAni"><a class="c3" href="../pages/moving.html">MOVING</a></li>
            <li class="scAni"><a class="c4" href="../pages/still.html">STILL</a></li>
            <li class="scAni"><a class="c5" href="../pages/interactive.html">INTERACTIVE</a></li>
            <li class="scAni"><a href="../pages/info.html">INFO</a></li>
        </ul>
    </nav>
</header>

<header class="mobile-head sticky">
    <nav>
        <h1><a href="./">XXHYZ<br/>LUNA CHEN</a></h1>
        <span class="material-symbols-outlined">menu     
            <ul class="works-menu">
                <li><a class="c1" href="../pages/index.html">FILM</a></li>
                <li><a class="c2" href="../pages/3dcg.html">3D/CG</a></li>
                <li><a class="c3" href="../pages/moving.html">MOVING</a></li>
                <li><a class="c4" href="../pages/still.html">STILL</a></li>
                <li><a class="c5" href="../pages/interactive.html">INTERACTIVE</a></li>
                <li><a href="../pages/info.html">INFO</a></li>
            </ul>
        </span>
    </nav>
</header>
`;

class CustomHeader extends HTMLElement {
  constructor() {
    super();
    const clone = headerTemplate.content.cloneNode(true);
    this.appendChild(clone);
  }
}
window.customElements.define("custom-header", CustomHeader);

// Footer template
const footerTemplate = document.createElement("template");
footerTemplate.innerHTML = `
<footer >
                <nav>
                    <ul>
                        <li>
                            <a href="https://www.instagram.com/xxhyz.lunachen/"><i class="fa-brands fa-instagram fa-xl icons" style="color: #ffffff;"></i></a>
                        </li>
                        <li>
                            <a href="https://twitter.com/XXHYZ2"><i class="fa-brands fa-x-twitter fa-xl icons" style="color: #ffffff;"></i></a>
                        </li>
                        <li>
                            <a href="https://space.bilibili.com/4558677"><i class="fa-brands fa-bilibili fa-xl icons" style="color: #ffffff;"></i></a>
                        </li>
                    </ul>
                </nav>
            </footer>
`;

class CustomFooter extends HTMLElement {
  constructor() {
    super();
    const clone = footerTemplate.content.cloneNode(true);
    this.appendChild(clone);
  }
}
window.customElements.define("custom-footer", CustomFooter);
