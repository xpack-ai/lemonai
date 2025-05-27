<template>
    <div class="sample">
        <div v-for="(item,index) in data" :key="index" class="sample-item">
            <div class="item" @click="handleClick(item)">
                <div class="item-title">
                    {{item.name}}
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
    import { ref } from 'vue';
    const emit  = defineEmits(['sampleClick']);
    // 示例数据
    const data = ref([
        {
            name:"Apple Market Analysis and Sales Forecast 2025",
            content:`Based on Apple's financial reports over the past five years and market analysis data from IDC/Partner, combined with the following multidimensional elements:
Regional market trends (China US trade policy, India manufacturing incentive program, EU digital bill)
Product line evolution (iPhone iteration cycle, AR/VR device launch plan, service business growth)
Macroeconomic indicators (IMF's 2025 GDP forecast for major economies, exchange rate volatility model)
Competitive landscape (Huawei's return to high-end models, Samsung's layout of foldable devices)
Supply chain factors (progress of Southeast Asian production base transfer, stability of chip supply)
requirement:

When predicting the top three sales markets, please provide:
Proportion of sales revenue segmented by product category (hardware/service)
Calculation of compound growth rate year-on-year in 2023
Local market specificity (such as China's trade in policy and India's tariff structure)
Using sensitivity analysis method, provide three predictions: baseline scenario, optimistic scenario, and conservative scenario
Annotations on key variables (such as the possibility of upgrading technology bans between China and the United States, and the risk of global economic recession)
Compare 2022 actual data with 2025 forecast data in the form of web pages and reports`
        },
        {
            name:"Children's Clock Quiz Web App",
            content:"Create a web application with the following requirements: randomly display a clock, display the time scale with numbers on the clock, provide two drop-down boxes for children to choose the hour and minute displayed on the current clock, and verify if the result is correct.final use nohup python3 http server to serve the app html"
        },
        {
            name:"Evolution of U.S. AI Industry Policies Over the Past Decade",
            content:"Create an illustrated report analyzing the evolution of U.S. AI industry policies over the past decade."
        }

    ]);

    const handleClick = (item) => {
        emit('sampleClick',item);
    }
</script>
<style scoped>
    .sample{
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        max-width: 768px;
        width: 100%;
        margin-left: auto;
        margin-right: auto;
    }

    .sample-item{
        padding-top: .5rem;
        padding-bottom: .5rem;
        padding-left: .75rem;
        padding-right: .75rem;
        gap: .375rem;
        align-items: center;
        cursor: pointer;
        display: flex;
        border-radius: 100px;
        background-color: #37352f0a;
    }
</style>