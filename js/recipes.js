/* Recipes from TheMealDB (free, no account, no AI). Shows ingredients and reads steps one by one. */
(function () {
  var API = 'https://www.themealdb.com/api/json/v1/1/';
  M.recipe = null; // {title, image, ingredients[], steps[], i, sample}

  var sample = {
    title: 'Masala Omelette (sample)', image: '', sample: true,
    ingredients: ['2 eggs', '1 small onion, chopped', '1 green chilli, chopped', '1 tomato, chopped', 'Pinch of turmeric', 'Salt to taste', 'Coriander leaves', '1 tsp oil'],
    steps: ['Crack the eggs into a bowl and whisk them with salt and turmeric.', 'Stir in the onion, chilli, tomato and coriander.', 'Heat the oil in a pan on medium heat.', 'Pour in the egg mixture and spread it out evenly.', 'Cook for about 2 minutes until the bottom is set, then flip.', 'Cook 1 more minute, then serve hot with toast.']
  };

  function parseMeal(meal) {
    var ing = [];
    for (var i = 1; i <= 20; i++) {
      var n = (meal['strIngredient' + i] || '').trim(), q = (meal['strMeasure' + i] || '').trim();
      if (n) ing.push((q ? q + ' ' : '') + n);
    }
    var lines = String(meal.strInstructions || '').split(/\r?\n+/).map(function (x) { return x.replace(/^(step\s*)?\d+[.):]?\s*/i, '').trim(); })
      .filter(function (x) { return x && !/^step\s*\d*$/i.test(x); });
    if (lines.length < 3) lines = String(meal.strInstructions || '').match(/[^.!?]+[.!?]+/g) || lines;
    // keep each step a comfortable length to read out
    var steps = [];
    lines.forEach(function (l) {
      if (l.length < 260) { steps.push(l.trim()); return; }
      var parts = l.match(/[^.!?]+[.!?]+/g) || [l], buf = '';
      parts.forEach(function (p) { if ((buf + p).length > 220 && buf) { steps.push(buf.trim()); buf = ''; } buf += p; });
      if (buf.trim()) steps.push(buf.trim());
    });
    return { title: meal.strMeal, image: meal.strMealThumb || '', ingredients: ing, steps: steps, i: 0, sample: false };
  }

  function get(path) { return fetch(API + path).then(function (r) { if (!r.ok) throw new Error('recipe'); return r.json(); }); }

  M.findRecipe = function (query, byIngredient) {
    var q = encodeURIComponent(query.trim());
    var first = byIngredient ? Promise.resolve({ meals: null }) : get('search.php?s=' + q);
    return first.then(function (j) {
      if (j.meals && j.meals.length) return j.meals[0];
      return get('filter.php?i=' + q.replace(/%20/g, '_')).then(function (f) {
        if (!f.meals || !f.meals.length) return null;
        var pick = f.meals[Math.floor(Math.random() * f.meals.length)];
        return get('lookup.php?i=' + pick.idMeal).then(function (l) { return l.meals && l.meals[0]; });
      });
    }).then(function (meal) { return meal ? parseMeal(meal) : null; });
  };
  M.randomRecipe = function () { return get('random.php').then(function (j) { return j.meals && j.meals[0] ? parseMeal(j.meals[0]) : null; }); };

  M.renderRecipe = function () {
    var r = M.recipe; if (!r) return;
    M.$('recTitle').textContent = r.title;
    var img = M.$('recImg');
    if (r.image) { img.src = r.image + '/preview'; img.hidden = false; } else img.hidden = true;
    var ul = M.$('recIng'); ul.innerHTML = '';
    r.ingredients.forEach(function (x) { var li = document.createElement('li'); li.textContent = x; ul.appendChild(li); });
    M.$('recStepNo').textContent = 'Step ' + (r.i + 1) + ' of ' + r.steps.length;
    M.$('recStep').textContent = r.steps[r.i] || '';
    M.$('recNote').textContent = r.sample ? 'Sample recipe. Real recipes load once the mirror is online.' : 'Say "next step", "repeat" or "ingredients".';
  };
  function open(r, intro) {
    M.recipe = r; r.i = 0; M.show('recipe'); M.renderRecipe();
    return M.say((intro || 'Here\'s ' + r.title + '.') + ' You\'ll need ' + r.ingredients.length + ' ingredients. Say "next step" when you\'re ready.');
  }
  function loading(q) { M.show('recipe'); M.$('recTitle').textContent = 'Finding ' + q + '…'; M.$('recStep').textContent = ''; M.$('recIng').innerHTML = ''; }
  function failed(q) {
    return function () { return open(JSON.parse(JSON.stringify(sample)), 'I couldn\'t reach the recipe website from here, so here\'s a sample recipe instead.'); };
  }

  M.addCommand(['^(?:give me |find |show me |get )?(?:a )?recipe (?:for|of) (.+)$', '^how (?:do i|to|do you|can i) (?:make|cook|bake|prepare) (?:a |an |some )?(.+)$', '^(?:i want to|let\'?s|help me) (?:make|cook|bake) (?:a |an |some )?(.+)$', '^(.+) recipe$'], function (m) {
    var q = m[1].replace(/\b(please|today|tonight|recipe)\b/g, '').trim();
    if (!q || q.length > 40 || /^(a|any|random|surprise|new|another|some|close|exit|stop|end|done with|next|the)$/.test(q)) return false;
    loading(q);
    M.findRecipe(q).then(function (r) { if (r) open(r); else M.say('I couldn\'t find a recipe for ' + q + '. Try a simpler name, like pasta or chicken curry.'); }).catch(failed(q));
    return true;
  });
  M.addCommand(['what can i (?:make|cook|bake) with (.+)$', 'recipe(?:s)? with (.+)$', 'i have (.+?)(?: at home)?,? what (?:can|should) i (?:make|cook)'], function (m) {
    var q = m[1].split(/,| and /)[0].trim();
    loading(q);
    M.findRecipe(q, true).then(function (r) { if (r) open(r, 'With ' + q + ', you could make ' + r.title + '.'); else M.say('I couldn\'t find anything with ' + q + '.'); }).catch(failed(q));
    return true;
  });
  M.addCommand(['(random|surprise|any) recipe', 'what should i (cook|make|eat)( for (dinner|lunch|breakfast))?', 'i\'?m hungry'], function () {
    loading('a recipe');
    M.randomRecipe().then(function (r) { if (r) open(r, 'How about ' + r.title + '?'); }).catch(failed(''));
    return true;
  });
  function active() { return M.recipe && (M.current === 'recipe' || /recipe/.test(M.current)); }
  M.addCommand(['^(next|next step|what\'?s next|then what|done|ok next|okay next)$'], function () {
    if (!active()) return false;
    var r = M.recipe;
    if (r.i >= r.steps.length - 1) return M.say('That was the last step. Enjoy your ' + r.title.replace(' (sample)', '') + '!');
    r.i++; M.renderRecipe(); return M.say('Step ' + (r.i + 1) + '. ' + r.steps[r.i]);
  });
  M.addCommand(['^(previous|previous step|go back|back a step|last step)$'], function () {
    if (!active()) return false;
    var r = M.recipe; r.i = Math.max(0, r.i - 1); M.renderRecipe(); return M.say('Step ' + (r.i + 1) + '. ' + r.steps[r.i]);
  });
  M.addCommand(['^(repeat|repeat that|say that again|again|what was that)$', '^(read|repeat) (the )?step$', '^(start|first step|begin)$'], function (m, t) {
    if (!active()) return false;
    var r = M.recipe; if (/start|first|begin/.test(t)) { r.i = 0; M.renderRecipe(); }
    return M.say('Step ' + (r.i + 1) + '. ' + r.steps[r.i]);
  });
  M.addCommand(['(read|what are)( the)? ingredients', 'what do i need', '^ingredients$'], function () {
    if (!M.recipe) return false;
    return M.say('You need: ' + M.recipe.ingredients.join(', ') + '.');
  });
  M.addCommand(['(close|exit|stop|done with)( the)? recipe', 'stop cooking'], function () { M.recipe = null; M.show('home'); return M.say('Recipe closed. Hope it was tasty!'); });
})();
