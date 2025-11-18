window.addEventListener("DOMContentLoaded", () => {
  // ---------- 基础配置 ----------

  const STAT_OPTIONS = ["暴击", "幸运", "精通", "急速", "全能"];

  const STAT_ORDER = ["暴击", "精通", "幸运", "急速", "全能"];
  const STAT_META = {
    "暴击": { base: 5, k: 19975 },
    "精通": { base: 6, k: 19975 },
    "幸运": { base: 5, k: 19975 },
    "急速": { base: 0, k: 19975 },
    "全能": { base: 0, k: 11200 }
  };

  // 装等 → 防具大/小/重铸
  const BASE_CONFIG = {
    120: { main: 540, sub: 270, reforge: 162 },
    140: { main: 756, sub: 378, reforge: 226 },
    160: { main: 1080, sub: 540, reforge: 324 }
  };

  // 镶嵌数值
  const INLAY_VALUES_ARMOR = [200, 250, 300, 500, 560, 600];        // 头/衣/手/鞋
  const INLAY_VALUES_RING_CHARM = [140, 175, 210, 300, 360, 420];   // 左右手环/护符

  // 非武器部位，在不同主属性下【不会出现】的进阶属性
  const FORBIDDEN = {
    "力量": {
      "头部": ["全能"],
      "衣服": ["幸运"],
      "护手": ["急速"],
      "鞋子": ["精通"],
      "耳坠": ["精通"],
      "项链": ["急速"],
      "戒指": ["幸运"],
      "左手环": ["暴击"],
      "右手环": ["暴击"],
      "护符": ["全能"]
    },
    "智力": {
      "头部": ["暴击"],
      "衣服": ["暴击"],
      "护手": ["全能"],
      "鞋子": ["幸运"],
      "耳坠": ["全能"],
      "项链": ["幸运"],
      "戒指": ["精通"],
      "左手环": ["急速"],
      "右手环": ["精通"],
      "护符": ["急速"]
    },
    "敏捷": {
      "头部": ["急速"],
      "衣服": ["精通"],
      "护手": ["暴击"],
      "鞋子": ["暴击"],
      "耳坠": ["急速"],
      "项链": ["精通"],
      "戒指": ["全能"],
      "左手环": ["全能"],
      "右手环": ["幸运"],
      "护符": ["幸运"]
    }
  };

  // 武器装等 & 类型
  const WEAPON_ILVLS = [100, 120, 130, 140, 150, 160, 170, 180];

  const WEAPON_TYPE_BY_ILVL = {
    100: ["海神武器"],
    120: ["副本金武器"],
    130: ["团本红武器"],
    140: ["副本金武器", "海神武器"],
    150: ["团本红武器"],
    160: ["副本金武器", "海神武器"],
    170: ["团本红武器"],
    180: ["海神武器"]
  };

  const ARMOR_SLOTS = [
    "头部",
    "衣服",
    "护手",
    "鞋子",
    "耳坠",
    "项链",
    "戒指",
    "左手环",
    "右手环",
    "护符"
  ];

  const ARMOR_ILVLS = [120, 140, 160];
  const ARMOR_TYPES = ["副本掉落", "团本打造"];

  // ---------- 工具函数 ----------

  function fillSelect(sel, list, emptyText = "未选择") {
    sel.innerHTML = "";
    const empty = document.createElement("option");
    empty.value = "";
    empty.textContent = emptyText;
    sel.appendChild(empty);
    (list || []).forEach((v) => {
      const o = document.createElement("option");
      o.value = v;
      o.textContent = v;
      sel.appendChild(o);
    });
  }

  function getArmorConfig(ilvl) {
    return BASE_CONFIG[Number(ilvl)] || null;
  }

  function getWeaponConfig(ilvl) {
    const base = BASE_CONFIG[Number(ilvl)];
    if (!base) return null;
    return {
      main: base.main * 2,
      sub: base.sub * 2,
      reforge: base.reforge * 2
    };
  }

  // ---------- 主属性方块 ----------

  const mainStatRadios = Array.from(
    document.querySelectorAll('input[name="main-stat"]')
  );
  const mainStatLabels = Array.from(
    document.querySelectorAll(".main-stat-option")
  );

  function getMainStat() {
    const r = mainStatRadios.find((x) => x.checked);
    return r ? r.value : "";
  }

  function updateMainStatUI() {
    const current = getMainStat();
    mainStatLabels.forEach((label) => {
      if (label.dataset.value === current) {
        label.classList.add("active");
      } else {
        label.classList.remove("active");
      }
    });
  }

  function getAllowedStatsForArmor(slotName, armorType) {
    const main = getMainStat();
    if (armorType !== "副本掉落" || !main) {
      return STAT_OPTIONS.slice();
    }
    const forbid = (FORBIDDEN[main] && FORBIDDEN[main][slotName]) || [];
    return STAT_OPTIONS.filter((s) => !forbid.includes(s));
  }

  // ---------- 武器部分 ----------

  const w_ilvl = document.getElementById("weapon-ilvl");
  const w_type = document.getElementById("weapon-type");
  const w_s1 = document.getElementById("weapon-stat1");
  const w_s1v = document.getElementById("weapon-stat1-value");
  const w_s1i = document.getElementById("weapon-stat1-input");
  const w_s2 = document.getElementById("weapon-stat2");
  const w_s2v = document.getElementById("weapon-stat2-value");
  const w_s2i = document.getElementById("weapon-stat2-input");
  const w_rstat = document.getElementById("weapon-reforge-stat");
  const w_rval = document.getElementById("weapon-reforge-value");
  const w_ri = document.getElementById("weapon-reforge-input");
  const w_customToggle = document.getElementById("weapon-custom-toggle");

  const e1 = document.getElementById("extra1");
  const e1v = document.getElementById("extra1-value");
  const e2 = document.getElementById("extra2");
  const e2v = document.getElementById("extra2-value");

  const btnAddExtra3 = document.getElementById("btn-add-extra3");
  const weaponExtraTemplate = document.getElementById("extra3-container");
  let weaponExtraContainer = null;

  if (weaponExtraTemplate && weaponExtraTemplate.parentNode) {
    weaponExtraContainer = document.createElement("div");
    weaponExtraContainer.id = "weapon-extra-container";
    weaponExtraTemplate.parentNode.insertBefore(
      weaponExtraContainer,
      weaponExtraTemplate.nextSibling
    );
    weaponExtraTemplate.classList.add("hidden");
  }

  // 底部额外属性 + 转换因子
  const extraFlatRowTemplate = document.getElementById("extra-flat-row");
  const btnAddExtraFlat = document.getElementById("btn-add-extra-flat");
  let extraFlatContainer = null;

  if (extraFlatRowTemplate && extraFlatRowTemplate.parentNode) {
    extraFlatContainer = document.createElement("div");
    extraFlatContainer.id = "extra-flat-container";
    extraFlatRowTemplate.parentNode.insertBefore(
      extraFlatContainer,
      extraFlatRowTemplate.nextSibling
    );
  }

  const convTemplate = document.getElementById("extra-conv-rows");
  const btnAddConv = document.getElementById("btn-add-conv");
  let convContainer = null;

  if (convTemplate && convTemplate.parentNode) {
    convContainer = document.createElement("div");
    convContainer.id = "conv-container";
    convTemplate.parentNode.insertBefore(
      convContainer,
      convTemplate.nextSibling
    );
    convTemplate.classList.add("hidden");
  }

  // 初始下拉
  fillSelect(w_ilvl, WEAPON_ILVLS, "装等");
  fillSelect(w_s1, STAT_OPTIONS);
  fillSelect(w_s2, STAT_OPTIONS);
  fillSelect(w_rstat, STAT_OPTIONS);
  fillSelect(e1, STAT_OPTIONS);
  fillSelect(e2, STAT_OPTIONS);

  function updateWeaponType() {
    const ilvl = Number(w_ilvl.value);
    const types =
      WEAPON_TYPE_BY_ILVL[ilvl] || ["副本金武器", "团本红武器", "海神武器"];
    fillSelect(w_type, types, "武器类型");
    if (types.length > 0) w_type.value = types[0];
  }

  function updateWeaponValueSelects() {
    const cfg = getWeaponConfig(w_ilvl.value);

    function fillAdv(sel) {
      sel.innerHTML = "";
      if (!cfg) {
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "（未配置）";
        sel.appendChild(o);
        return;
      }
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "请选择";
      sel.appendChild(empty);
      [cfg.main, cfg.sub].forEach((v) => {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        sel.appendChild(o);
      });
    }

    function fillReforge(sel) {
      sel.innerHTML = "";
      if (!cfg) {
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "（未配置）";
        sel.appendChild(o);
        return;
      }
      const o = document.createElement("option");
      o.value = cfg.reforge;
      o.textContent = cfg.reforge;
      sel.appendChild(o);
      sel.value = cfg.reforge;
    }

    fillAdv(w_s1v);
    fillAdv(w_s2v);
    fillReforge(w_rval);
  }

  function updateWeaponReforgeDisabled() {
    const t = w_type.value;
    const disable = t === "海神武器" || t === "团本红武器";
    w_rstat.disabled = disable;
    w_rval.disabled = disable;
    w_ri.disabled = disable;
    if (disable) {
      w_rstat.value = "";
      w_rval.value = "";
      w_ri.value = "";
    }
  }

  function updateWeaponCustomMode() {
    const on = w_customToggle.checked;
    const togglePair = (selectEl, inputEl) => {
      if (!selectEl || !inputEl) return;
      if (on) {
        selectEl.classList.add("hidden");
        inputEl.classList.remove("hidden");
      } else {
        selectEl.classList.remove("hidden");
        inputEl.classList.add("hidden");
      }
    };
    togglePair(w_s1v, w_s1i);
    togglePair(w_s2v, w_s2i);
    togglePair(w_rval, w_ri);
    updateAll();
  }

  // ---------- 防具部分 ----------

  const armorContainer = document.getElementById("armor-container");
  const armorCards = [];

  function updateArmorStatOptionsForCard(card) {
    const allowed = getAllowedStatsForArmor(card.name, card.type.value);
    const updateOne = (sel, labelText) => {
      const prev = sel.value;
      fillSelect(sel, allowed, labelText);
      if (allowed.includes(prev)) {
        sel.value = prev;
      }
    };
    updateOne(card.stat1, "属性 1");
    updateOne(card.stat2, "属性 2");
  }

  function updateAllArmorStatOptions() {
    armorCards.forEach((card) => updateArmorStatOptionsForCard(card));
  }

  function createArmorCards() {
    const NEED_INLAY_ARMOR = ["头部", "衣服", "护手", "鞋子"];
    const NEED_INLAY_RING = ["左手环", "右手环", "护符"];

    armorContainer.innerHTML = "";
    armorCards.length = 0;

    ARMOR_SLOTS.forEach((name) => {
      const card = document.createElement("div");
      card.className = "armor-card";

      // 顶部：名称 + 自定义
      const headerRow = document.createElement("div");
      headerRow.className = "armor-header-row";

      const title = document.createElement("div");
      title.className = "armor-card-title";
      title.textContent = name;

      const chkCustom = document.createElement("input");
      chkCustom.type = "checkbox";
      chkCustom.className = "armor-custom-checkbox";

      const customLabel = document.createElement("label");
      customLabel.className = "armor-custom-label";
      customLabel.textContent = "自定义";
      customLabel.appendChild(chkCustom);

      headerRow.appendChild(title);
      headerRow.appendChild(customLabel);
      card.appendChild(headerRow);

      // 第二行：装等 + 类型
      const topRow = document.createElement("div");
      topRow.className = "field-row armor-top-row";

      const labIlvl = document.createElement("label");
      labIlvl.textContent = "装等";
      const s_ilvl = document.createElement("select");

      const labType = document.createElement("label");
      labType.textContent = "类型";
      const s_type = document.createElement("select");

      topRow.appendChild(labIlvl);
      topRow.appendChild(s_ilvl);
      topRow.appendChild(labType);
      topRow.appendChild(s_type);
      card.appendChild(topRow);

      // 工具：生成“属性 + 数值”一行
      function makeStatRow(labelText) {
        const row = document.createElement("div");
        row.className = "field-row stat-row";

        const labStat = document.createElement("label");
        labStat.textContent = labelText;
        const statSel = document.createElement("select");

        const labVal = document.createElement("span");
        labVal.className = "inline-label";
        labVal.textContent = "数值";

        const valCell = document.createElement("div");
        valCell.className = "value-cell";

        const valSel = document.createElement("select");
        valSel.className = "value-select";

        const valInput = document.createElement("input");
        valInput.type = "number";
        valInput.step = "1";
        valInput.className = "value-input hidden";

        valCell.appendChild(valSel);
        valCell.appendChild(valInput);

        row.appendChild(labStat);
        row.appendChild(statSel);
        row.appendChild(labVal);
        row.appendChild(valCell);

        card.appendChild(row);

        return { statSel, valSel, valInput };
      }

      // 属性 1 / 2 / 重铸
      const row1 = makeStatRow("属性 1");
      const row2 = makeStatRow("属性 2");
      const rowReforge = makeStatRow("重铸");

      const s_s1 = row1.statSel;
      const s_s1v = row1.valSel;
      const i_s1v = row1.valInput;

      const s_s2 = row2.statSel;
      const s_s2v = row2.valSel;
      const i_s2v = row2.valInput;

      const s_rstat = rowReforge.statSel;
      const s_rval = rowReforge.valSel;
      const i_rval = rowReforge.valInput;

      // 镶嵌（部分部位才有）
      let inlayStat = null;
      let inlayValSelect = null;
      let inlayValInput = null;

      if (
        NEED_INLAY_ARMOR.includes(name) ||
        NEED_INLAY_RING.includes(name)
      ) {
        const rowInlay = makeStatRow("镶嵌");
        inlayStat = rowInlay.statSel;
        inlayValSelect = rowInlay.valSel;
        inlayValInput = rowInlay.valInput;

        // 镶嵌属性：始终 5 选 1
        fillSelect(inlayStat, STAT_OPTIONS, "镶嵌属性");

        const vals = NEED_INLAY_ARMOR.includes(name)
          ? INLAY_VALUES_ARMOR
          : INLAY_VALUES_RING_CHARM;

        inlayValSelect.innerHTML = "";
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "请选择";
        inlayValSelect.appendChild(empty);
        vals.forEach((v) => {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = v;
          inlayValSelect.appendChild(o);
        });
      }

      armorContainer.appendChild(card);

      // 初始下拉填充
      fillSelect(s_ilvl, ARMOR_ILVLS, "装等");
      fillSelect(s_type, ARMOR_TYPES, "类型");
      fillSelect(s_s1, STAT_OPTIONS, "属性 1");
      fillSelect(s_s2, STAT_OPTIONS, "属性 2");
      fillSelect(s_rstat, STAT_OPTIONS, "重铸属性");

      function fillArmorValues(sel, ilvl, type) {
        const cfg = getArmorConfig(ilvl);
        sel.innerHTML = "";
        if (!cfg) {
          const o = document.createElement("option");
          o.value = "";
          o.textContent = "（未配置）";
          sel.appendChild(o);
          return;
        }
        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = "请选择";
        sel.appendChild(empty);

        const values =
          type === "团本打造" ? [cfg.main] : [cfg.main, cfg.sub];

        values.forEach((v) => {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = v;
          sel.appendChild(o);
        });
      }

      function fillArmorReforge(sel, ilvl) {
        const cfg = getArmorConfig(ilvl);
        sel.innerHTML = "";
        if (!cfg) {
          const o = document.createElement("option");
          o.value = "";
          o.textContent = "（未配置）";
          sel.appendChild(o);
          return;
        }
        const o = document.createElement("option");
        o.value = cfg.reforge;
        o.textContent = cfg.reforge;
        sel.appendChild(o);
        sel.value = cfg.reforge;
      }

      function refreshArmorValues() {
        fillArmorValues(s_s1v, s_ilvl.value, s_type.value);
        fillArmorValues(s_s2v, s_ilvl.value, s_type.value);
        fillArmorReforge(s_rval, s_ilvl.value);
      }

      // 初始填充一次
      refreshArmorValues();

      // 事件绑定
      s_ilvl.addEventListener("change", () => {
        refreshArmorValues();
        updateArmorStatOptionsForCard(cardInfo);
        updateAll();
      });

      s_type.addEventListener("change", () => {
        refreshArmorValues();
        updateArmorStatOptionsForCard(cardInfo);
        updateAll();
      });

      [
        s_s1,
        s_s1v,
        s_s2,
        s_s2v,
        s_rstat,
        s_rval,
        i_s1v,
        i_s2v,
        i_rval
      ].forEach((el) => {
        if (!el) return;
        const evt = el.tagName === "INPUT" ? "input" : "change";
        el.addEventListener(evt, updateAll);
      });

      if (inlayStat) {
        [inlayStat, inlayValSelect, inlayValInput].forEach((el) => {
          if (!el) return;
          const evt = el.tagName === "INPUT" ? "input" : "change";
          el.addEventListener(evt, updateAll);
        });
      }

      function updateArmorCustomMode() {
        const on = chkCustom.checked;
        const togglePair = (sel, inp) => {
          if (!sel || !inp) return;
          if (on) {
            sel.classList.add("hidden");
            inp.classList.remove("hidden");
          } else {
            sel.classList.remove("hidden");
            inp.classList.add("hidden");
          }
        };
        togglePair(s_s1v, i_s1v);
        togglePair(s_s2v, i_s2v);
        togglePair(s_rval, i_rval);
        togglePair(inlayValSelect, inlayValInput);
        updateAll();
      }

      chkCustom.addEventListener("change", updateArmorCustomMode);

      const cardInfo = {
        name,
        ilvl: s_ilvl,
        type: s_type,
        stat1: s_s1,
        val1Select: s_s1v,
        val1Input: i_s1v,
        stat2: s_s2,
        val2Select: s_s2v,
        val2Input: i_s2v,
        reforgeStat: s_rstat,
        reforgeValSelect: s_rval,
        reforgeValInput: i_rval,
        inlayStat,
        inlayValSelect,
        inlayValInput,
        customToggle: chkCustom
      };

      armorCards.push(cardInfo);
      updateArmorStatOptionsForCard(cardInfo);
    });
  }

  createArmorCards();

  // ---------- Debug & 计算 ----------

  const dbg = document.getElementById("debug-output");
  const finalStatsDiv = document.getElementById("final-stats");

  function getNumericFromSelectOrInput(selValue, inputEl, isCustomOn) {
    if (isCustomOn) {
      const v = parseFloat(inputEl?.value);
      return isNaN(v) ? 0 : v;
    } else {
      const v = parseFloat(selValue);
      return isNaN(v) ? 0 : v;
    }
  }

  function updateAll() {
    // Debug 信息（可选）
    const weapon = {
      ilvl: w_ilvl.value,
      type: w_type.value,
      adv1: { stat: w_s1.value, val: w_s1v.value || w_s1i.value },
      adv2: { stat: w_s2.value, val: w_s2v.value || w_s2i.value },
      reforge: w_rstat.disabled
        ? "无"
        : { stat: w_rstat.value, val: w_rval.value || w_ri.value },
      extra1: { stat: e1.value, val: e1v.value },
      extra2: { stat: e2.value, val: e2v.value }
    };

    const armor = {};
    armorCards.forEach((a) => {
      armor[a.name] = {
        ilvl: a.ilvl.value,
        type: a.type.value,
        adv1: {
          stat: a.stat1.value,
          val: a.val1Select.value || a.val1Input.value
        },
        adv2: {
          stat: a.stat2.value,
          val: a.val2Select.value || a.val2Input.value
        },
        reforge: {
          stat: a.reforgeStat.value,
          val: a.reforgeValSelect.value || a.reforgeValInput.value
        },
        inlay: a.inlayStat
          ? {
              stat: a.inlayStat.value,
              val:
                a.inlayValSelect?.value || a.inlayValInput?.value
            }
          : null
      };
    });

    if (dbg) {
      dbg.textContent = JSON.stringify({ weapon, armor }, null, 2);
    }

    const rating = { 暴击: 0, 精通: 0, 幸运: 0, 急速: 0, 全能: 0 };
    const bonusPct = { 暴击: 0, 精通: 0, 幸运: 0, 急速: 0, 全能: 0 };

    function addRating(statName, value) {
      if (!statName) return;
      if (rating.hasOwnProperty(statName)) rating[statName] += value;
    }

    function addBonus(statName, valStr) {
      if (!statName) return;
      const v = parseFloat(valStr);
      if (isNaN(v)) return;
      if (bonusPct.hasOwnProperty(statName)) bonusPct[statName] += v;
    }

    // 武器 rating
    const weaponCustomOn = w_customToggle.checked;
    addRating(
      w_s1.value,
      getNumericFromSelectOrInput(w_s1v.value, w_s1i, weaponCustomOn)
    );
    addRating(
      w_s2.value,
      getNumericFromSelectOrInput(w_s2v.value, w_s2i, weaponCustomOn)
    );
    if (!w_rstat.disabled) {
      addRating(
        w_rstat.value,
        getNumericFromSelectOrInput(w_rval.value, w_ri, weaponCustomOn)
      );
    }

    // 防具 rating
    armorCards.forEach((a) => {
      const on = a.customToggle.checked;
      addRating(
        a.stat1.value,
        getNumericFromSelectOrInput(
          a.val1Select.value,
          a.val1Input,
          on
        )
      );
      addRating(
        a.stat2.value,
        getNumericFromSelectOrInput(
          a.val2Select.value,
          a.val2Input,
          on
        )
      );
      addRating(
        a.reforgeStat.value,
        getNumericFromSelectOrInput(
          a.reforgeValSelect.value,
          a.reforgeValInput,
          on
        )
      );
      if (a.inlayStat && (a.inlayValSelect || a.inlayValInput)) {
        const selVal = a.inlayValSelect ? a.inlayValSelect.value : "";
        addRating(
          a.inlayStat.value,
          getNumericFromSelectOrInput(
            selVal,
            a.inlayValInput,
            on
          )
        );
      }
    });

    // 武器额外百分比：固定 1、2
    addBonus(e1.value, e1v.value);
    addBonus(e2.value, e2v.value);

    // 武器额外百分比：多行（按钮添加出来的）
    if (weaponExtraContainer) {
      const blocks =
        weaponExtraContainer.querySelectorAll(".weapon-extra-block");
      blocks.forEach((block) => {
        const sel = block.querySelector("select");
        const input = block.querySelector("input");
        if (!sel || !input) return;
        addBonus(sel.value, input.value);
      });
    }

    // 额外属性（flat）
    if (extraFlatContainer) {
      const rows = extraFlatContainer.querySelectorAll(".field-row");
      rows.forEach((row) => {
        const sel = row.querySelector("select");
        const input = row.querySelector("input");
        if (!sel || !input) return;

        const stat = sel.value;
        const val = parseFloat(input.value);
        if (stat && !isNaN(val) && rating.hasOwnProperty(stat)) {
          rating[stat] += val;
        }
      });
    }

    // 转换因子块
    if (convContainer) {
      const blocks = convContainer.querySelectorAll(".conv-block");
      blocks.forEach((block) => {
        const selects = block.querySelectorAll("select");
        const inputs = block.querySelectorAll("input");

        // 提升
        if (selects[0] && inputs[0]) {
          const statUp = selects[0].value;
          const pctUp = parseFloat(inputs[0].value);
          if (
            statUp &&
            !isNaN(pctUp) &&
            rating.hasOwnProperty(statUp)
          ) {
            rating[statUp] *= 1 + pctUp / 100;
          }
        }

        // 降低
        if (selects[1] && inputs[1]) {
          const statDown = selects[1].value;
          const pctDown = parseFloat(inputs[1].value);
          if (
            statDown &&
            !isNaN(pctDown) &&
            rating.hasOwnProperty(statDown)
          ) {
            rating[statDown] *= 1 - pctDown / 100;
          }
        }
      });
    }

    // 计算最终属性
    let html =
      '<table><tr><th>属性</th><th>总数值 x</th><th>额外%</th><th>最终%</th></tr>';

    STAT_ORDER.forEach((name) => {
      const meta = STAT_META[name];
      const x = rating[name] || 0;
      const extra = bonusPct[name] || 0;
      const base = meta.base;
      const k = meta.k;

      let finalPct;
      if (x <= 0) {
        finalPct = base + extra;
      } else {
        finalPct = (x / (x + k)) * 100 + base + extra;
      }

      html += `<tr>
        <td>${name}</td>
        <td>${x.toFixed(0)}</td>
        <td>${extra.toFixed(2)}%</td>
        <td>${finalPct.toFixed(4)}%</td>
      </tr>`;
    });

    html += "</table>";
    finalStatsDiv.innerHTML = html;
  }

  // ---------- 事件绑定 ----------

  w_ilvl.addEventListener("change", () => {
    updateWeaponType();
    updateWeaponValueSelects();
    updateWeaponReforgeDisabled();
    updateAll();
  });

  w_type.addEventListener("change", () => {
    updateWeaponReforgeDisabled();
    updateAll();
  });

  w_customToggle.addEventListener("change", () => {
    updateWeaponCustomMode();
    updateAll();
  });

  [w_s1, w_s1v, w_s1i, w_s2, w_s2v, w_s2i, w_rstat, w_rval, w_ri].forEach(
    (el) => {
      const evt = el.tagName === "INPUT" ? "input" : "change";
      el.addEventListener(evt, updateAll);
    }
  );

  [e1, e1v, e2, e2v].forEach((el) => {
    if (!el) return;
    const evt = el.tagName === "INPUT" ? "input" : "change";
    el.addEventListener(evt, updateAll);
  });

  // 创建一组新的“武器额外词条”块
  function createWeaponExtraBlock() {
    if (!weaponExtraTemplate || !weaponExtraContainer) return;

    const block = weaponExtraTemplate.cloneNode(true);
    block.id = "";
    block.classList.remove("hidden");
    block.classList.add("weapon-extra-block");

    const sel = block.querySelector("select");
    const input = block.querySelector("input");

    if (sel) {
      sel.id = "";
      fillSelect(sel, STAT_OPTIONS, "属性");
      sel.addEventListener("change", updateAll);
    }
    if (input) {
      input.id = "";
      input.value = "";
      input.addEventListener("input", updateAll);
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "删";
    removeBtn.style.marginLeft = "4px";
    removeBtn.addEventListener("click", () => {
      block.remove();
      updateAll();
    });

    const lastRow = block.querySelector(".field-row.stat-row");
    if (lastRow) {
      lastRow.appendChild(removeBtn);
    } else {
      block.appendChild(removeBtn);
    }

    weaponExtraContainer.appendChild(block);
  }

  if (btnAddExtra3) {
    btnAddExtra3.addEventListener("click", createWeaponExtraBlock);
  }

  // 创建一行新的“额外属性”行
  function createExtraFlatRow() {
    if (!extraFlatRowTemplate || !extraFlatContainer) return;

    const row = extraFlatRowTemplate.cloneNode(true);
    row.id = "";
    row.classList.remove("hidden");

    const sel = row.querySelector("select");
    const input = row.querySelector("input");

    if (sel) {
      sel.id = "";
      fillSelect(sel, STAT_OPTIONS, "属性");
      sel.addEventListener("change", updateAll);
    }
    if (input) {
      input.id = "";
      input.value = "";
      input.addEventListener("input", updateAll);
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "删";
    removeBtn.style.marginLeft = "4px";
    removeBtn.addEventListener("click", () => {
      row.remove();
      updateAll();
    });
    row.appendChild(removeBtn);

    extraFlatContainer.appendChild(row);
  }

  if (btnAddExtraFlat) {
    btnAddExtraFlat.addEventListener("click", createExtraFlatRow);
  }

  // 创建一组新的“转换因子”块
  function createConvBlock() {
    if (!convTemplate || !convContainer) return;

    const block = convTemplate.cloneNode(true);
    block.id = "";
    block.classList.remove("hidden");
    block.classList.add("conv-block");

    const selects = block.querySelectorAll("select");
    const inputs = block.querySelectorAll("input");

    const upSel = selects[0];
    const upInput = inputs[0];
    const downSel = selects[1];
    const downInput = inputs[1];

    if (upSel) {
      upSel.id = "";
      fillSelect(upSel, STAT_OPTIONS, "提升属性");
      upSel.addEventListener("change", updateAll);
    }
    if (upInput) {
      upInput.id = "";
      upInput.value = "";
      upInput.addEventListener("input", updateAll);
    }

    if (downSel) {
      downSel.id = "";
      fillSelect(downSel, STAT_OPTIONS, "降低属性");
      downSel.addEventListener("change", updateAll);
    }
    if (downInput) {
      downInput.id = "";
      downInput.value = "";
      downInput.addEventListener("input", updateAll);
    }

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "删";
    removeBtn.style.marginLeft = "4px";
    removeBtn.addEventListener("click", () => {
      block.remove();
      updateAll();
    });

    const firstRow = block.querySelector(".field-row");
    if (firstRow) {
      firstRow.appendChild(removeBtn);
    } else {
      block.appendChild(removeBtn);
    }

    convContainer.appendChild(block);
  }

  if (btnAddConv) {
    btnAddConv.addEventListener("click", createConvBlock);
  }

  mainStatRadios.forEach((r) => {
    r.addEventListener("change", () => {
      updateMainStatUI();
      updateAllArmorStatOptions();
      updateAll();
    });
  });

  // ---------- 初始化 ----------

  updateWeaponType();
  updateWeaponValueSelects();
  updateWeaponReforgeDisabled();
  updateWeaponCustomMode();
  updateMainStatUI();
  updateAllArmorStatOptions();
  updateAll();
});
