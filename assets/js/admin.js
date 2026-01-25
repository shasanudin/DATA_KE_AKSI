let articles = [];

fetch('data/alur.json')
.then(r => r.json())
.then(data => {
    articles = data.articles || [];
    renderList();
});

document.getElementById('articleForm').addEventListener('submit', e => {
    e.preventDefault();

    const article = {
        title: title.value,
        author: author.value,
        date: date.value,
        lead: lead.value,
        steps: steps.value.split('\n').map(t => ({
            title: t.split(':')[0] || 'Tahap',
            content: t
        })),
        requirements: requirements.value.split('\n'),
        quote: quote.value
    };

    articles.unshift(article);
    renderList();
    saveFile();
    e.target.reset();
});

function renderList() {
    const list = document.getElementById('articleList');
    list.innerHTML = '';

    articles.forEach((a, i) => {
        const li = document.createElement('li');
        li.className = "list-group-item d-flex justify-content-between align-items-center";

        li.innerHTML = `
            <strong>${a.title}</strong>
            <button class="btn btn-sm btn-danger">Hapus</button>
        `;

        li.querySelector('button').onclick = () => {
            articles.splice(i, 1);
            renderList();
            saveFile();
        };

        list.appendChild(li);
    });
}

function saveFile() {
    const blob = new Blob(
        [JSON.stringify({ articles }, null, 2)],
        { type: "application/json" }
    );

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "alur.json";
    link.click();
}
