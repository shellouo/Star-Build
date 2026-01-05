window.addEventListener("DOMContentLoaded", () => {
  // ---------- 基础配置 ----------

  const STAT_OPTIONS = ["暴击", "幸运", "精通", "急速", "全能"];


  // ---------- v1 存档协议相关常量 ----------

// 主属性枚举：0=力量, 1=智力, 2=敏捷
const MAIN_STAT_LIST = ["力量", "智力", "敏捷"];

// 属性枚举：顺序不要乱改，将来有新属性就往后面追加
const STAT_LIST = ["暴击", "精通", "幸运", "急速", "全能"];

// 装等枚举（防具）
const ARMOR_ILVL_LIST = [120, 140, 160, 165, 170];

// 装等枚举（武器）
const WEAPON_ILVL_LIST = [100, 120, 130, 140, 150, 160, 170, 180];

// 类型枚举
const ARMOR_TYPE_LIST = ["副本掉落", "团本打造"];
const WEAPON_TYPE_LIST = ["副本金武器", "团本红武器", "海神武器"];

// 小工具：从列表找索引，找不到就 -1
function idxOf(list, value) {
  const i = list.indexOf(value);
  return i === -1 ? -1 : i;
}
// ---------- base64url 工具（把 JSON 串变成 URL 友好的短串） ----------

// 字符串 → base64url
function encodeBase64Url(str) {
  // 先安全处理成 UTF-8，再 btoa
  const base64 = btoa(unescape(encodeURIComponent(str)));
  // 替换成 URL-safe 版本，并去掉尾部 '='
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// base64url → 字符串
function decodeBase64Url(str) {
  // 补齐 padding
  const padLen = (4 - (str.length % 4)) % 4;
  const padded = str + "=".repeat(padLen);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const utf8 = atob(base64);
  return decodeURIComponent(escape(utf8));
}






  const STAT_ORDER = ["暴击", "精通", "幸运", "急速", "全能"];
  const STAT_META = {
    "暴击": { base: 5, k: 19975 },
    "精通": { base: 6, k: 19975 },
    "幸运": { base: 5, k: 19975 },
    "急速": { base: 0, k: 19975 },
    "全能": { base: 0, k: 11200 }
  };
  const DEFAULT_K_NON_VERS = 19975; // 非全能默认系数
  const DEFAULT_K_VERS = 11200;     // 全能默认系数

  // 装等 → 防具大/小/重铸

  // ✅ 新：防具配置（按 装等 × 类型）
// v1/v2 对应：属性1/属性2 下拉里可选的两个数值
  const ARMOR_CONFIG = {
    120: {
      "副本掉落": { v1: 540, v2: 270, reforge: 162 },
      "团本打造": { v1: 540, v2: 540, reforge: 162 } // 如果旧规则其实不是这样，你可以按真实数填
    },
    140: {
      "副本掉落": { v1: 756, v2: 378, reforge: 226 },
      "团本打造": { v1: 756, v2: 756, reforge: 226 }
    },
    150: {
      "团本打造": { v1: 828, v2: 828, reforge: 226 }
    },

    // ✅ 你这次新增/更新的
    160: {
      "副本掉落": { v1: 954,  v2: 477,  reforge: 286 },
      "团本打造": { v1: 954,  v2: 954,  reforge: 286 }
    },
    165: {
      "团本打造": { v1: 990,  v2: 990,  reforge: 286 }
    },
    170: {
      "团本打造": { v1: 1035, v2: 1035, reforge: 286 }
    }
  };

// ✅ 兼容：根据 ilvl+type 取防具配置
  function getArmorConfig(ilvl, type) {
    const byIl = ARMOR_CONFIG[Number(ilvl)];
    if (!byIl) return null;
    return byIl[type] || null;
  }

// ✅ 新：武器配置（按装等）
  const WEAPON_CONFIG = {
    160: { v1: 1908, v2: 954,  reforge: 572 },
    170: { v1: 2480, v2: 2480, reforge: 0 } // 0 = 无重铸
  };
  function getWeaponConfig(ilvl) {
    return WEAPON_CONFIG[Number(ilvl)] || null;
  }

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

  const ARMOR_ILVLS = [120, 140, 150, 160, 165, 170];
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
      [cfg.v1, cfg.v2].forEach((v) => {
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
    const ilvl = Number(w_ilvl.value);
    const t = w_type.value;
    const cfg = getWeaponConfig(ilvl);

    const disable =
        !cfg || cfg.reforge <= 0 ||
        t === "海神武器" || t === "团本红武器";

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
        const cfg = getArmorConfig(ilvl, type); // ✅ 改这里
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

        // ✅ 两条进阶可选值（去重一下，避免 954/954 出现两次一样的）
        const values = [cfg.v1, cfg.v2].filter((v) => Number(v) > 0);
        const uniq = Array.from(new Set(values));

        uniq.forEach((v) => {
          const o = document.createElement("option");
          o.value = v;
          o.textContent = v;
          sel.appendChild(o);
        });
      }


      function fillArmorReforge(sel, ilvl, type) {
        const cfg = getArmorConfig(ilvl, type); // ✅ 改这里
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
        fillArmorReforge(s_rval, s_ilvl.value, s_type.value);
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
  const coefNonVersSelect = document.getElementById("coef-non-vers-select");
  const coefNonVersCustom = document.getElementById("coef-non-vers-custom");
  const coefNonVersInput  = document.getElementById("coef-non-vers-input");

  const coefVersSelect = document.getElementById("coef-vers-select");
  const coefVersCustom = document.getElementById("coef-vers-custom");
  const coefVersInput  = document.getElementById("coef-vers-input");

  function getNumericFromSelectOrInput(selValue, inputEl, isCustomOn) {
    if (isCustomOn) {
      const v = parseFloat(inputEl?.value);
      return isNaN(v) ? 0 : v;
    } else {
      const v = parseFloat(selValue);
      return isNaN(v) ? 0 : v;
    }
  }

    // 读取当前的非全能系数 k
  function getCurrentKNonVers() {
    if (coefNonVersCustom && coefNonVersCustom.checked) {
      const v = parseFloat(coefNonVersInput.value);
      if (isNaN(v) || v <= 0) return DEFAULT_K_NON_VERS;
      return v;
    }
    if (coefNonVersSelect) {
      const v = parseFloat(coefNonVersSelect.value);
      if (!isNaN(v) && v > 0) return v;
    }
    return DEFAULT_K_NON_VERS;
  }

  // 读取当前的全能系数 k
  function getCurrentKVers() {
    if (coefVersCustom && coefVersCustom.checked) {
      const v = parseFloat(coefVersInput.value);
      if (isNaN(v) || v <= 0) return DEFAULT_K_VERS;
      return v;
    }
    if (coefVersSelect) {
      const v = parseFloat(coefVersSelect.value);
      if (!isNaN(v) && v > 0) return v;
    }
    return DEFAULT_K_VERS;
  }

  // 切换自定义开关时，隐藏/显示 select vs input
  function updateCoefControls() {
    if (coefNonVersSelect && coefNonVersInput && coefNonVersCustom) {
      const on = coefNonVersCustom.checked;
      if (on) {
        coefNonVersSelect.classList.add("hidden");
        coefNonVersInput.classList.remove("hidden");
      } else {
        coefNonVersSelect.classList.remove("hidden");
        coefNonVersInput.classList.add("hidden");
      }
    }

    if (coefVersSelect && coefVersInput && coefVersCustom) {
      const on = coefVersCustom.checked;
      if (on) {
        coefVersSelect.classList.add("hidden");
        coefVersInput.classList.remove("hidden");
      } else {
        coefVersSelect.classList.remove("hidden");
        coefVersInput.classList.add("hidden");
      }
    }

    // 切换后重新算一遍
    updateAll();
  }



  // ---------- 收集当前 UI 状态：内部结构 ----------
  function collectCurrentBuild() {
      // 1) 主属性
      const mainStatStr = getMainStat(); // 已经有这个函数，返回 "力量"/"智力"/"敏捷" 或 ""

      // 2) 武器
      const weaponCustomOn = w_customToggle.checked;

      function readWeaponLine(statSel, valSel, valInput) {
        const statName = statSel.value;
        if (!statName) return null;
        const statIndex = idxOf(STAT_LIST, statName);
        if (statIndex < 0) return null;

        let value = 0;
        if (weaponCustomOn && valInput && !valInput.classList.contains("hidden")) {
          value = parseInt(valInput.value, 10) || 0;
        } else {
          value = parseInt(valSel.value, 10) || 0;
        }
        if (!value) return null;

        return [statIndex, value]; // v1 简化版：只存“属性索引 + 数值”
      }

      const weapon = {
        ilIndex: idxOf(WEAPON_ILVL_LIST, Number(w_ilvl.value)),   // 装等索引
        typeIndex: idxOf(WEAPON_TYPE_LIST, w_type.value),         // 类型索引
        adv1: readWeaponLine(w_s1, w_s1v, w_s1i),
        adv2: readWeaponLine(w_s2, w_s2v, w_s2i),
        reforge: (w_rstat.disabled ? null : readWeaponLine(w_rstat, w_rval, w_ri)),
        extras: []
      };

      // 固定额外 1/2 百分比
      [ [e1, e1v], [e2, e2v] ].forEach(([sel, input]) => {
        const statName = sel.value;
        if (!statName) return;
        const statIndex = idxOf(STAT_LIST, statName);
        if (statIndex < 0) return;
        const pct = parseFloat(input.value);
        if (isNaN(pct) || !pct) return;
        weapon.extras.push([statIndex, Math.round(pct * 10)]); // 百分比 *10 存整数
      });

      // 动态添加的额外词条（按钮生成的那些）
      if (weaponExtraContainer) {
        const blocks = weaponExtraContainer.querySelectorAll(".weapon-extra-block");
        blocks.forEach((block) => {
          const sel = block.querySelector("select");
          const input = block.querySelector("input");
          if (!sel || !input) return;
          const statName = sel.value;
          const statIndex = idxOf(STAT_LIST, statName);
          if (statIndex < 0) return;
          const pct = parseFloat(input.value);
          if (isNaN(pct) || !pct) return;
          weapon.extras.push([statIndex, Math.round(pct * 10)]);
        });
      }

      // 3) 十个部位
      const armor = armorCards.map((a) => {
        const customOn = a.customToggle.checked;

        function readLine(statSel, valSel, valInput) {
          const statName = statSel.value;
          if (!statName) return null;
          const statIndex = idxOf(STAT_LIST, statName);
          if (statIndex < 0) return null;

          let value = 0;
          if (customOn && valInput && !valInput.classList.contains("hidden")) {
            value = parseInt(valInput.value, 10) || 0;
          } else {
            value = parseInt(valSel.value, 10) || 0;
          }
          if (!value) return null;
          return [statIndex, value];
        }

        const slotObj = {
          ilIndex: idxOf(ARMOR_ILVL_LIST, Number(a.ilvl.value)),
          typeIndex: idxOf(ARMOR_TYPE_LIST, a.type.value),
          adv1: readLine(a.stat1, a.val1Select, a.val1Input),
          adv2: readLine(a.stat2, a.val2Select, a.val2Input),
          reforge: readLine(a.reforgeStat, a.reforgeValSelect, a.reforgeValInput),
          inlay: null
        };

        if (a.inlayStat && (a.inlayValSelect || a.inlayValInput)) {
          const statName = a.inlayStat.value;
          const statIndex = idxOf(STAT_LIST, statName);
          if (statIndex >= 0) {
            let value = 0;
            if (customOn && a.inlayValInput && !a.inlayValInput.classList.contains("hidden")) {
              value = parseInt(a.inlayValInput.value, 10) || 0;
            } else if (a.inlayValSelect) {
              value = parseInt(a.inlayValSelect.value, 10) || 0;
            }
            if (value) {
              slotObj.inlay = [statIndex, value];
            }
          }
        }

        return slotObj;
      });

      // 4) 底部额外属性 flat + 转换 conv
      const extraFlat = [];
      if (extraFlatContainer) {
        const rows = extraFlatContainer.querySelectorAll(".field-row");
        rows.forEach((row) => {
          const sel = row.querySelector("select");
          const input = row.querySelector("input");
          if (!sel || !input) return;
          const statIndex = idxOf(STAT_LIST, sel.value);
          if (statIndex < 0) return;
          const val = parseInt(input.value, 10) || 0;
          if (!val) return;
          extraFlat.push([statIndex, val]);
        });
      }

      const extraConv = [];
      if (convContainer) {
        const blocks = convContainer.querySelectorAll(".conv-block");
        blocks.forEach((block) => {
          const selects = block.querySelectorAll("select");
          const inputs = block.querySelectorAll("input");
          if (selects.length < 2 || inputs.length < 2) return;
          const upIndex = idxOf(STAT_LIST, selects[0].value);
          const downIndex = idxOf(STAT_LIST, selects[1].value);
          const upPct = parseFloat(inputs[0].value);
          const downPct = parseFloat(inputs[1].value);
          if (upIndex < 0 || isNaN(upPct)) return;
          if (downIndex < 0 || isNaN(downPct)) return;
          extraConv.push([
            upIndex,
            Math.round(upPct * 10),
            downIndex,
            Math.round(downPct * 10)
          ]);
        });
      }
      // 当前系数
      const kNonVers = getCurrentKNonVers();
      const kVers = getCurrentKVers();

      return {
        mainStatIndex: idxOf(MAIN_STAT_LIST, mainStatStr),
        weapon,
        armor,
        extra: {
          flat: extraFlat,
          conv: extraConv,
          kNonVers,
          kVers   
        }
      };
  }
// ---------- v1 存档编码：内部结构 -> token 字符串 ----------

  function encodeV1Token() {
      const state = collectCurrentBuild();

      const saveObj = {
        v: 1,
        m: state.mainStatIndex,
        w: {
          il: state.weapon.ilIndex,
          t: state.weapon.typeIndex,
          a1: state.weapon.adv1,
          a2: state.weapon.adv2,
          r:  state.weapon.reforge,
          ex: state.weapon.extras
        },
        a: state.armor,
        ex: state.extra
      };

      const json = JSON.stringify(saveObj);
      const encoded = encodeBase64Url(json);
      const token = "v1_" + encoded;
      return token;
  }
  // 生成完整分享链接
  function makeShareUrlV1() {
      const token = encodeV1Token();
      const baseUrl = window.location.origin + window.location.pathname;
      return baseUrl + "?" + token;
  }
  window.collectCurrentBuild = collectCurrentBuild;
  window.encodeV1Token = encodeV1Token;
  window.makeShareUrlV1 = makeShareUrlV1;



    // ---------- v1 存档解码：存档对象 -> 回填 UI ----------
  function applySaveV1(saveObj) {
    if (!saveObj || saveObj.v !== 1) return;

    // 1) 主属性
    const mainIndex = saveObj.m;
    if (mainIndex >= 0 && mainIndex < MAIN_STAT_LIST.length) {
      const mainValue = MAIN_STAT_LIST[mainIndex];
      mainStatRadios.forEach((r) => {
        r.checked = (r.value === mainValue);
      });
      updateMainStatUI();
    }

    // 2) 武器
    const wData = saveObj.w || {};
    const weaponIlvl = WEAPON_ILVL_LIST[wData.il];
    if (weaponIlvl != null) {
      w_ilvl.value = String(weaponIlvl);
      updateWeaponType();
      updateWeaponValueSelects();
      updateWeaponReforgeDisabled();
    }

    const weaponType = WEAPON_TYPE_LIST[wData.t];
    if (weaponType) {
      w_type.value = weaponType;
      updateWeaponReforgeDisabled();
    }

    // 统一切到自定义模式，直接填数值
    w_customToggle.checked = true;
    updateWeaponCustomMode();

    function setWeaponLine(data, statSel, valInput) {
      if (!data) {
        statSel.value = "";
        valInput.value = "";
        return;
      }
      const [statIndex, value] = data;
      const statName = STAT_LIST[statIndex];
      if (!statName) return;
      statSel.value = statName;
      valInput.value = String(value);
    }

    setWeaponLine(wData.a1, w_s1, w_s1i);
    setWeaponLine(wData.a2, w_s2, w_s2i);
    if (!w_rstat.disabled) {
      setWeaponLine(wData.r, w_rstat, w_ri);
    } else {
      w_rstat.value = "";
      w_ri.value = "";
    }

    // 额外词条：先用 e1/e2，再用动态块
    const exList = (wData.ex || []).slice();
    function setExtraFixed(sel, input) {
      if (!sel || !input) return;
      const data = exList.shift();
      if (!data) {
        sel.value = "";
        input.value = "";
        return;
      }
      const [statIndex, v10] = data;
      const statName = STAT_LIST[statIndex];
      if (!statName) return;
      sel.value = statName;
      input.value = (v10 / 10).toFixed(1).replace(/\.0$/, "");
    }
    setExtraFixed(e1, e1v);
    setExtraFixed(e2, e2v);

    if (weaponExtraContainer) {
      weaponExtraContainer.innerHTML = "";
      exList.forEach(([statIndex, v10]) => {
        createWeaponExtraBlock();
        const block = weaponExtraContainer.lastElementChild;
        const sel = block.querySelector("select");
        const input = block.querySelector("input");
        if (!sel || !input) return;
        const statName = STAT_LIST[statIndex];
        if (!statName) return;
        sel.value = statName;
        input.value = (v10 / 10).toFixed(1).replace(/\.0$/, "");
      });
    }

    // 3) 防具
    const armorArr = saveObj.a || [];
    armorCards.forEach((card, idx) => {
      const slotData = armorArr[idx];
      if (!slotData) return;

      const ilvl = ARMOR_ILVL_LIST[slotData.ilIndex];
      if (ilvl != null) {
        card.ilvl.value = String(ilvl);
      }
      const typeName = ARMOR_TYPE_LIST[slotData.typeIndex];
      if (typeName) {
        card.type.value = typeName;
      }

      // 触发 change，让数值列表刷新
      card.ilvl.dispatchEvent(new Event("change"));
      card.type.dispatchEvent(new Event("change"));

      // 切换成自定义模式
      card.customToggle.checked = true;
      card.customToggle.dispatchEvent(new Event("change"));

      function setArmorLine(data, statSel, valInput) {
        if (!data) {
          statSel.value = "";
          valInput.value = "";
          return;
        }
        const [statIndex, value] = data;
        const statName = STAT_LIST[statIndex];
        if (!statName) return;
        statSel.value = statName;
        valInput.value = String(value);
      }

      setArmorLine(slotData.adv1, card.stat1, card.val1Input);
      setArmorLine(slotData.adv2, card.stat2, card.val2Input);
      setArmorLine(slotData.reforge, card.reforgeStat, card.reforgeValInput);

      if (card.inlayStat && card.inlayValInput) {
        setArmorLine(slotData.inlay, card.inlayStat, card.inlayValInput);
      }
    });


    const ex = saveObj.ex || {};

    // 4) 底部额外属性 flat
    if (extraFlatContainer && Array.isArray(ex.flat)) {
      extraFlatContainer.innerHTML = "";
      ex.flat.forEach(([statIndex, value]) => {
        createExtraFlatRow();
        const row = extraFlatContainer.lastElementChild;
        const sel = row.querySelector("select");
        const input = row.querySelector("input");
        if (!sel || !input) return;
        const statName = STAT_LIST[statIndex];
        if (!statName) return;
        sel.value = statName;
        input.value = String(value);
      });
    }

    // 转换因子
    if (convContainer && Array.isArray(ex.conv)) {
      convContainer.innerHTML = "";
      ex.conv.forEach(([upIndex, up10, downIndex, down10]) => {
        createConvBlock();
        const block = convContainer.lastElementChild;
        const selects = block.querySelectorAll("select");
        const inputs = block.querySelectorAll("input");
        if (selects.length < 2 || inputs.length < 2) return;

        const upName = STAT_LIST[upIndex];
        const downName = STAT_LIST[downIndex];
        if (upName) selects[0].value = upName;
        if (downName) selects[1].value = downName;
        inputs[0].value = (up10 / 10).toFixed(1).replace(/\.0$/, "");
        inputs[1].value = (down10 / 10).toFixed(1).replace(/\.0$/, "");
      });
    }
    // 5) 百分比系数（如果老链接里没有这两项，就保持默认）
    if (typeof ex.kNonVers === "number") {
      const v = ex.kNonVers;
      if (coefNonVersSelect && coefNonVersCustom && coefNonVersInput) {
        if (v === 19975 || v === 4460) {
          coefNonVersCustom.checked = false;
          coefNonVersSelect.value = String(v);
          coefNonVersInput.value = "";
        } else {
          coefNonVersCustom.checked = true;
          coefNonVersInput.value = String(v);
        }
        updateCoefControls();
      }
    }

    if (typeof ex.kVers === "number") {
      const v = ex.kVers;
      if (coefVersSelect && coefVersCustom && coefVersInput) {
        if (v === 11200 || v === 2500) {
          coefVersCustom.checked = false;
          coefVersSelect.value = String(v);
          coefVersInput.value = "";
        } else {
          coefVersCustom.checked = true;
          coefVersInput.value = String(v);
        }
        updateCoefControls();
      }
    }

    // 最后再跑一遍
    updateAllArmorStatOptions();
    updateAll();
  }

  // ---------- 从 URL 读取并应用 ----------
  function loadFromUrlIfAny() {
    const qs = window.location.search;
    if (!qs || qs.length <= 1) return;
    const token = qs.slice(1); // 去掉 '?'

    if (token.startsWith("v1_")) {
      const encoded = token.slice(3);
      try {
        const json = decodeBase64Url(encoded);
        const obj = JSON.parse(json);
        applySaveV1(obj);
      } catch (e) {
        console.error("解析 v1 存档失败：", e);
      }
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

      let k;
      if (name === "全能") {
        k = getCurrentKVers();
      } else {
        k = getCurrentKNonVers();
      }
      if (!k) {
        k = meta.k; // 兜底
      }

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

    // 百分比系数事件
  if (coefNonVersCustom) {
    coefNonVersCustom.addEventListener("change", updateCoefControls);
  }
  if (coefNonVersSelect) {
    coefNonVersSelect.addEventListener("change", updateAll);
  }
  if (coefNonVersInput) {
    coefNonVersInput.addEventListener("input", updateAll);
  }

  if (coefVersCustom) {
    coefVersCustom.addEventListener("change", updateCoefControls);
  }
  if (coefVersSelect) {
    coefVersSelect.addEventListener("change", updateAll);
  }
  if (coefVersInput) {
    coefVersInput.addEventListener("input", updateAll);
  }





    // ---------- 分享按钮 ----------

  const btnShare = document.getElementById("btn-share");
  const btnCopyShare = document.getElementById("btn-copy-share");
  const shareUrlInput = document.getElementById("share-url");
  const shareStatus = document.getElementById("share-status");

  function setShareStatus(text) {
    if (!shareStatus) return;
    shareStatus.textContent = text;
    if (!text) return;
    // 简单 2 秒清空
    setTimeout(() => {
      if (shareStatus.textContent === text) {
        shareStatus.textContent = "";
      }
    }, 2000);
  }

  if (btnShare && shareUrlInput) {
    btnShare.addEventListener("click", () => {
      try {
        const url = makeShareUrlV1();   // 用你刚刚写好的函数
        shareUrlInput.value = url;
        setShareStatus("链接已生成");
      } catch (e) {
        console.error(e);
        setShareStatus("生成失败（看控制台报错）");
      }
    });
  }

  if (btnCopyShare && shareUrlInput) {
    btnCopyShare.addEventListener("click", async () => {
      const url = shareUrlInput.value.trim();
      if (!url) {
        setShareStatus("请先生成链接");
        return;
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          // 老浏览器兜底
          shareUrlInput.select();
          document.execCommand("copy");
        }
        setShareStatus("已复制到剪贴板");
      } catch (e) {
        console.error(e);
        setShareStatus("复制失败");
      }
    });
  }


  // ---------- 初始化 ----------

  updateWeaponType();
  updateWeaponValueSelects();
  updateWeaponReforgeDisabled();
  updateWeaponCustomMode();
  updateMainStatUI();
  updateAllArmorStatOptions();

  updateCoefControls();   // 同步一次系数 UI 默认状态

  loadFromUrlIfAny();
  updateAll();
});
