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
            name:"北京10月旅行计划",
            content:"请提供一份北京10月份旅行计划的详细行程和一本简单的HTML格式旅行手册，其中包含地图、景点介绍、及旅行小贴士，方便我们全程参考。"
        },
        {
            name:"特惠公寓搜索",
            content:"请给我推荐一个合适的特惠公寓。  要求：根据用户的需求，推荐一个合适的特惠公寓，并给出推荐理由。"
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
        width: 100%;
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