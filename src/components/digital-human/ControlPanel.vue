<template>
  <div class="control-panel">
    <div class="panel-header">
      <div class="panel-header-content">动画控制面板</div>
    </div>
    <div class="panel-content">
      <div class="control-group">
        <h3>可见性控制</h3>
        <yk-space justify="around">
          <yk-checkbox
            v-model="modelVisible"
            :default-checked="true"
            @change="handleModelVisibilityChange"
          >
            <label>显示模型</label>
          </yk-checkbox>
          <yk-checkbox
            v-model="skeletonVisible"
            :default-checked="false"
            @change="handleSkeletonVisibilityChange"
          >
            <label>显示骨骼</label>
          </yk-checkbox>
        </yk-space>
      </div>

      <div class="control-group">
        <h3>动作控制</h3>
        <div class="control-item">
          <yk-space size="s">
            <yk-button
              @click="onActionChange('stand')"
              :disabled="currentAction === 'stand'"
            >
              stand
            </yk-button>
            <yk-button
              @click="onActionChange('freeze')"
              :disabled="currentAction === 'freeze'"
            >
              freeze
            </yk-button>
            <yk-button
              @click="onActionChange('footwork')"
              :disabled="currentAction === 'footwork'"
            >
              footwork
            </yk-button>
            <yk-button
              @click="onActionChange('ending')"
              :disabled="currentAction === 'ending'"
            >
              ending
            </yk-button>
          </yk-space>
        </div>
      </div>

      <div class="control-group">
        <h3>动作权重</h3>

        <div class="control-item">
          <label>stand</label>
          <yk-slider
            :model-value="standWeight"
            @update:model-value="
              (val) => {
                standWeight = val;
                onWeightChange();
              }
            "
            :min="0"
            :max="1"
            :step="0.01"
          ></yk-slider>
        </div>
        <div class="control-item">
          <label>freeze</label>
          <yk-slider
            :model-value="freezeWeight"
            @update:model-value="
              (val) => {
                freezeWeight = val;
                onWeightChange();
              }
            "
            :min="0"
            :max="1"
            :step="0.01"
          ></yk-slider>
        </div>
        <div class="control-item">
          <label>footwork</label>
          <yk-slider
            :model-value="footworkWeight"
            @update:model-value="
              (val) => {
                footworkWeight = val;
                onWeightChange();
              }
            "
            :min="0"
            :max="1"
            :step="0.01"
          ></yk-slider>
        </div>
        <div class="control-item">
          <label>ending</label>
          <yk-slider
            :model-value="endingWeight"
            @update:model-value="
              (val) => {
                endingWeight = val;
                onWeightChange();
              }
            "
            :min="0"
            :max="1"
            :step="0.01"
          ></yk-slider>
        </div>
      </div>

      <div class="control-group">
        <h3>播放控制</h3>
        <yk-space class="control-item" justify="around">
          <yk-button long @click="onPauseContinue">
            {{ isPaused ? "继续" : "暂停" }}
          </yk-button>
          <yk-button long @click="onStopAll">停止所有</yk-button>
        </yk-space>
      </div>
      <div class="control-group">
        <div class="control-item">
          <h3>播放速度</h3>
          <yk-slider
            :model-value="timeScale"
            @update:model-value="
              (val) => {
                timeScale = val;
                onSpeedChange();
              }
            "
            :min="0"
            :max="1.5"
            :step="0.01"
          ></yk-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, toRef } from "vue";

const settings = reactive({
  showModel: true,
  showSkeleton: false,
  standWeight: 1,
  freezeWeight: 0,
  footworkWeight: 0,
  endingWeight: 0,
  timeScale: 1.0,
  isPaused: false,
});

// 使用 toRef 创建响应式引用
const showModel = toRef(settings, "showModel");
const showSkeleton = toRef(settings, "showSkeleton");
const standWeight = toRef(settings, "standWeight");
const freezeWeight = toRef(settings, "freezeWeight");
const footworkWeight = toRef(settings, "footworkWeight");
const endingWeight = toRef(settings, "endingWeight");
const timeScale = toRef(settings, "timeScale");
const isPaused = toRef(settings, "isPaused");

const currentAction = ref("stand");

// 可见性控制
const modelVisible = ref(true);
const skeletonVisible = ref(false);

const handleModelVisibilityChange = (value: boolean) => {
  window.dispatchEvent(
    new CustomEvent("model-visibility-change", {
      detail: { visible: value },
    })
  );
};

const handleSkeletonVisibilityChange = (value: boolean) => {
  window.dispatchEvent(
    new CustomEvent("skeleton-visibility-change", {
      detail: { visible: value },
    })
  );
};

const onActionChange = (action) => {
  console.log("触发动作切换:", action);

  // 先触发事件，让 DigitalHuman 组件处理动作切换
  const event = new CustomEvent("action-change", {
    detail: { action },
  });
  console.log("创建事件:", event);
  window.dispatchEvent(event);
  console.log("事件已分发");

  // 事件分发后再更新本地状态
  currentAction.value = action;
};

const onWeightChange = () => {
  // 确保所有值都是数字类型
  const weights = {
    stand: Number(standWeight.value),
    freeze: Number(freezeWeight.value),
    footwork: Number(footworkWeight.value),
    ending: Number(endingWeight.value),
  };

  console.log("触发权重变化事件:", weights);

  // 触发父组件的权重变化事件
  const event = new CustomEvent("weight-change", {
    detail: weights,
  });
  console.log("创建权重事件:", event);
  window.dispatchEvent(event);
  console.log("权重事件已分发");
};

// 添加权重变化事件监听
window.addEventListener(
  "weight-change",
  (
    e: CustomEvent<{
      stand: number;
      freeze: number;
      footwork: number;
      ending: number;
    }>
  ) => {
    const weights = e.detail;
    console.log("收到权重变化事件:", weights);

    // 更新本地状态
    standWeight.value = weights.stand;
    freezeWeight.value = weights.freeze;
    footworkWeight.value = weights.footwork;
    endingWeight.value = weights.ending;

    // 更新当前动作
    if (weights.stand === 1) currentAction.value = "stand";
    else if (weights.freeze === 1) currentAction.value = "freeze";
    else if (weights.footwork === 1) currentAction.value = "footwork";
    else if (weights.ending === 1) currentAction.value = "ending";
  }
);

const onSpeedChange = () => {
  // 触发父组件的速度变化事件
  window.dispatchEvent(
    new CustomEvent("speed-change", {
      detail: { speed: timeScale.value },
    })
  );
};

const onPauseContinue = () => {
  isPaused.value = !isPaused.value;
  // 触发父组件的暂停/继续事件
  window.dispatchEvent(
    new CustomEvent("pause-continue", {
      detail: { paused: isPaused.value },
    })
  );
};

const onStopAll = () => {
  // 触发父组件的停止所有事件
  window.dispatchEvent(new CustomEvent("stop-all"));
};
</script>

<style lang="less" scoped>
.control-panel {
  background-color: @bg-color-l;
  border-radius: @radius-l;
  box-shadow: @shadow-m;

  z-index: 1000;

  .panel-header {
    background-color: @ecolor-light;
    border-radius: 12px 12px 0 0;
    color: @white;
    padding: 12px 16px;

    &-content {
      margin: auto;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }
  }

  .panel-content {
    padding: 12px 28px 12px 28px;

    .control-group {
      margin-bottom: 16px;

      h3 {
        font-size: 16px;
        color: @gray-8;
        font-weight: 600;
        margin-bottom: 4px;
      }

      label {
        color: @gray-8;
        font-size: @size-m;
      }
    }
  }
}
</style>
