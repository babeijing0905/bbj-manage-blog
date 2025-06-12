<template>
  <div ref="chart" :style="{ height: chartHeight }" class="chart"></div>
</template>

<script lang="ts" setup>
import { markRaw, onBeforeUnmount, onMounted, ref, watch } from "vue";

// 引入 echarts 核心模块，核心模块提供了 echarts 使用必须要的接口。
import * as echarts from "echarts/core";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from "echarts/charts";
// 引入标题，提示框，直角坐标系，数据集，内置数据转换器组件，组件后缀都为 Component
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
} from "echarts/components";
//引入折线饼图组件
//note:引入之后要在下面注册
import { LineChart } from "echarts/charts";

// 标签自动布局、全局过渡动画等特性
import { LabelLayout, UniversalTransition } from "echarts/features";
// 引入 Canvas 渲染器，注意引入 CanvasRenderer 或者 SVGRenderer 是必须的一步
import { CanvasRenderer } from "echarts/renderers";

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  BarChart,
  LabelLayout,
  UniversalTransition,
  CanvasRenderer,
  LineChart,
]);

const chart = ref<HTMLDivElement>();
const myChart = ref();
const props = defineProps(["data", "chartHeight"]);
const xAxisD = ref<string[]>([]);
const seriesD = ref<number[]>([]);
const option = ref();
const visit = (e: any) => {
  xAxisD.value = [];
  seriesD.value = [];
  for (let i = 0; i < e.length; i++) {
    xAxisD.value.push(e[i].date);
    seriesD.value.push(e[i].count);
  }
  option.value = {
    color: ["#ed6665"],
    grid: {
      top: "4%",
      left: "0%",
      right: "0%",
      bottom: "0%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisD.value,
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: seriesD.value,
        type: "line",
        smooth: true,
      },
    ],
  };
};
onMounted(() => {
  visit(props.data);
  //函数体
  //note:这里必须用MarkRaw包装否则，当页面宽度变化时，控制台会报错
  //markRaw 是 Vue 3 中的一个函数，用于标记一个对象使其永远不会被转换为响应式对象
  //init是初始化元素，她接受一个dom
  myChart.value = markRaw(echarts.init(chart.value as HTMLDivElement));
  myChart.value.setOption(option.value);
  //监听页面图形变化
  window.addEventListener("resize", () => {
    myChart.value.resize();
  });
});
watch(
  () => props.data,
  (e) => {
    visit(e);
    myChart.value = markRaw(echarts.init(chart.value as HTMLDivElement));
    myChart.value.setOption(option.value);
  }
);
//note:组件销毁前一定要取消监听的事件，不然会影响性能和占用内存
onBeforeUnmount(() => {
  window.removeEventListener("resize", () => {
    myChart.value.resize();
  });
});
</script>

<style lang="less" scoped>
.chart {
  width: 100%;
}
</style>
