<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>星痕共鸣配装器</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="style.css" />
</head>

<body>
  <h1>星痕共鸣配装器V1.2更新160/165/170相关数据</h1>
  <p class="subtitle">本工具用于星痕共鸣装备配装计算，持续更新中。</p>

  <!-- 主属性选择 -->
  <div class="field-row main-stat-row">
    <label>主属性</label>
    <div class="main-stat-toggle">
      <label class="main-stat-option" data-value="力量">
        <input type="radio" name="main-stat" value="力量" />
        <span class="box"></span>
        <span>力量</span>
      </label>
      <label class="main-stat-option" data-value="智力">
        <input type="radio" name="main-stat" value="智力" />
        <span class="box"></span>
        <span>智力</span>
      </label>
      <label class="main-stat-option" data-value="敏捷">
        <input type="radio" name="main-stat" value="敏捷" />
        <span class="box"></span>
        <span>敏捷</span>
      </label>
    </div>
  </div>

  <div class="layout">
    <!-- 左侧：武器 -->
    <div class="weapon-column">
      <div class="weapon-card-big">
        <!-- 标题 + 自定义 -->
        <div class="card-header-row">
          <div class="weapon-title">武器</div>
          <label class="armor-custom-label">
            自定义
            <input id="weapon-custom-toggle" type="checkbox" class="armor-custom-checkbox" />
          </label>
        </div>

        <!-- 装等 + 类型 -->
        <div class="field-row weapon-top-row">
          <label for="weapon-ilvl">装等</label>
          <select id="weapon-ilvl"></select>
          <label for="weapon-type">类型</label>
          <select id="weapon-type"></select>
        </div>

        <hr />

        <!-- 进阶 1：属性 + 数值 -->
        <div class="field-row stat-row">
          <label for="weapon-stat1">进阶 1</label>
          <select id="weapon-stat1"></select>
          <span class="inline-label">数值</span>
          <div class="value-cell">
            <select id="weapon-stat1-value" class="value-select"></select>
            <input id="weapon-stat1-input" class="value-input hidden" type="number" step="1" />
          </div>
        </div>

        <!-- 进阶 2 -->
        <div class="field-row stat-row">
          <label for="weapon-stat2">进阶 2</label>
          <select id="weapon-stat2"></select>
          <span class="inline-label">数值</span>
          <div class="value-cell">
            <select id="weapon-stat2-value" class="value-select"></select>
            <input id="weapon-stat2-input" class="value-input hidden" type="number" step="1" />
          </div>
        </div>

        <!-- 重铸 -->
        <div class="field-row stat-row">
          <label for="weapon-reforge-stat">重铸</label>
          <select id="weapon-reforge-stat"></select>
          <span class="inline-label">数值</span>
          <div class="value-cell">
            <select id="weapon-reforge-value" class="value-select"></select>
            <input id="weapon-reforge-input" class="value-input hidden" type="number" step="1" />
          </div>
        </div>

        <hr />

        <!-- 额外 1 -->
        <div class="field-row stat-row">
          <label for="extra1">额外 1</label>
          <select id="extra1"></select>
          <span class="inline-label">数值%</span>
          <div class="value-cell">
            <input id="extra1-value" type="number" step="0.1" />
          </div>
        </div>

        <!-- 额外 2 -->
        <div class="field-row stat-row">
          <label for="extra2">额外 2</label>
          <select id="extra2"></select>
          <span class="inline-label">数值%</span>
          <div class="value-cell">
            <input id="extra2-value" type="number" step="0.1" />
          </div>
        </div>

        <!-- 添加第 3 词条按钮 -->
        <div class="field-row">
          <label></label>
          <button id="btn-add-extra3" type="button">添加第 3 词条</button>
        </div>

        <!-- 第 3 词条模板（JS 会克隆） -->
        <div id="extra3-container" class="hidden">
          <div class="field-row stat-row">
            <label for="extra3">额外 3</label>
            <select id="extra3"></select>
            <span class="inline-label">数值%</span>
            <div class="value-cell">
              <input id="extra3-value" type="number" step="0.1" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：十个部位 -->
    <div class="armor-column">
      <div id="armor-container" class="armor-grid"></div>
    </div>
  </div>

  <!-- 底部：额外属性和转换因子 -->
  <div class="extra-panel">
    <div class="extra-row">
      <label>额外属性</label>
      <button id="btn-add-extra-flat" type="button">添加</button>
    </div>
    <div id="extra-flat-row" class="field-row hidden">
      <label></label>
      <select id="extra-flat-stat"></select>
      <input id="extra-flat-value" type="number" step="1" placeholder="数值" />
    </div>

    <div class="extra-row" style="margin-top:6px;">
      <label>转换因子</label>
      <button id="btn-add-conv" type="button">添加</button>
    </div>
    <div id="extra-conv-rows" class="hidden">
      <div class="field-row">
        <label></label>
        <span class="inline-label">属性提升</span>
        <select id="conv-up-stat"></select>
        <input id="conv-up-pct" type="number" step="0.1" placeholder="%" />
      </div>
      <div class="field-row">
        <label></label>
        <span class="inline-label">属性降低</span>
        <select id="conv-down-stat"></select>
        <input id="conv-down-pct" type="number" step="0.1" placeholder="%" />
      </div>
    </div>
  </div>

  <!-- 最终属性 -->
  <!-- 百分比系数设置 -->

<div class="coef-section">
  <h3>百分比系数设置</h3>

  <div class="field-row">
    <label>非全能系数</label>
    <select id="coef-non-vers-select">
      <option value="19975">19975（默认）</option>
      <option value="4460">4460</option>
    </select>
    <label class="inline-label" style="margin-left:8px;">自定义</label>
    <input type="checkbox" id="coef-non-vers-custom" />
    <input
      type="number"
      id="coef-non-vers-input"
      class="value-input hidden"
      placeholder="输入自定义 k"
    />
  </div>

  <div class="field-row">
    <label>全能系数</label>
    <select id="coef-vers-select">
      <option value="11200">11200（默认）</option>
      <option value="2500">2500</option>
    </select>
    <label class="inline-label" style="margin-left:8px;">自定义</label>
    <input type="checkbox" id="coef-vers-custom" />
    <input
      type="number"
      id="coef-vers-input"
      class="value-input hidden"
      placeholder="输入自定义 k"
    />
  </div>
</div>
  <div class="share-row">
    <button id="btn-share" type="button">生成分享链接</button>
    <input id="share-url" type="text" readonly placeholder="点击按钮生成链接" />
    <button id="btn-copy-share" type="button">复制链接</button>
    <span id="share-status" class="share-status"></span>
  </div>
  <div id="final-stats" class="final-stats"></div>
  <pre id="debug-output" class="debug-output"></pre>

  <script src="script.js"></script>
</body>
</html>
