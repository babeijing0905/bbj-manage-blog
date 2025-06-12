<template>
  <yk-space dir="vertical" size="xl" style="width: 100%">
    <div class="card" style="width: 100%">
      <div class="card-title">
        <p class="card-title-name">访问量</p>
        <yk-radio-group
          v-model="visitRadio"
          type="button"
          :solid="true"
          @change="getVisit"
        >
          <yk-radio value="week">近一周</yk-radio>
          <yk-radio value="month">近一月</yk-radio>
        </yk-radio-group>
      </div>
      <LineChart :data="visitData" chart-Height="208px" />
    </div>
    <div class="card" style="width: 100%">
      <div class="card-title">
        <p class="card-title-name">数据监测</p>
        <yk-radio-group v-model="checkRadio" type="button" :solid="true">
          <yk-radio value="week">近一周</yk-radio>
          <yk-radio value="month">近一月</yk-radio>
        </yk-radio-group>
      </div>
      <div style="display: flex">
        <PieChart
          :data="survey.data.device"
          title="设备总数"
          chart-height="208px"
        ></PieChart>
        <PieChart
          :data="survey.data.website"
          title="访问总数"
          chart-height="208px"
        ></PieChart>
      </div>
    </div>
  </yk-space>
</template>

<script lang="ts" setup>
import { LineChart } from "../echarts/index";
import { PieChart } from "../echarts/index";

import { visit, survey } from "../../mock/data";
import { onMounted, ref } from "vue";
const visitRadio = ref("week");
const checkRadio = ref("week");
//访问量
const visitData = ref(visit.data);
const getVisit = (e: string) => {
  let data = visit.data;
  if (e == "week") {
    data = data.slice(0, 7);
  }
  visitData.value = data;
};
onMounted(() => {
  getVisit(visitRadio.value);
});
</script>

<style lang="less" scoped></style>
