const { Eta } = require('./dist/eta.umd.js');

const eta = new Eta();

// Test the new Twig-like syntax
const template = `
<h1>{{ it.title }}</h1>
<p>Welcome {{ it.user.name }}!</p>

{% for (var i = 0; i < it.items.length; i++) { var item = it.items[i]; %}
  <li>{{ item.name }} - {{ item.price }}</li>
{% } %}

{% if (it.user.isAdmin) { %}
  <p>Admin Panel: {%~ it.adminContent %}</p>
{% } %}
`;

const data = {
  title: "My Twig-like Template",
  user: { name: "Alice", isAdmin: true },
  items: [
    { name: "Apple", price: "$1.00" },
    { name: "Banana", price: "$0.50" }
  ],
  adminContent: "<strong>Admin Controls</strong>"
};

try {
  const result = eta.renderString(template, data);
  console.log("=== Twig-like Syntax Test ===");
  console.log(result);
  console.log("\n=== SUCCESS: Twig-like syntax is working! ===");
} catch (error) {
  console.error("Error:", error.message);
}