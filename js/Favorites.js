import { GithubUser } from "./GithubUser.js";

//Classe que contem a lógica dos dados
export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.noFavorites = document.querySelector('.no-favorites');

    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login.toLowerCase() === username.toLowerCase());

      if(userExists)
        throw new Error('Usuário já cadastrado!');

      const user = await GithubUser.search(username);

      if(user.login === undefined)
        throw new Error('Usuário não encontrado!');

      this.entries = [user, ...this.entries];
      this.update();
      this.save()

    } catch(error) {
      alert(error.message)
    }
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login);

    this.update();
    this.save();
  }
}


//Classe que contem a visualização e eventos HTML
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody');
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.search button');
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input');
      this.add(value);
    }
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()
      row.querySelector('.user img').src = `http://github.com/${user.login}.png`;
      row.querySelector('.user img').alt = `Imagem de ${user.name}`;
      row.querySelector('.user a').href = `http://github.com/${user.login}`;
      row.querySelector('.user p').textContent = user.name;
      row.querySelector('.user span').textContent = user.name;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;

      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja remover essa linha?');
        if(isOk) {
          this.delete(user);
        }
      }
      this.tbody.append(row);
    })

    this.hasFavorites()
  }

  createRow() {
    const tr = document.createElement('tr');

    tr.innerHTML = `
    <td class="user">
      <div>
        <img src="http://github.com/Douglastfs.png" alt="Imagem de Douglas">
        <a href="http://github.com/Douglastfs" target="_blank">
          <p>Douglas Tenório</p>
          <span>/douglastfs</span>
        </a>
      </div>
    </td>
    <td class="repositories">9</td>
    <td class="followers">1</td>
    <td>
      <button class="remove">Remover</button>
    </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach((tr) => {
      tr.remove();
    })
  }

  hasFavorites() {
    if(this.entries.length === 0) {
      this.noFavorites.classList.remove('hide');
    } else {
      this.noFavorites.classList.add('hide');
    }
  }
}
