import { transform } from "@satorijs/element/jsx-runtime";
import { Context, Schema } from "koishi";

export const name = "fenglu-mouth";

export const inject = {
  required: ["database"],
  optional: ["adapter-onebot"],
};

export const usage = `
<h1>俸禄查询</h1>

<p>目前仅测试了 <b>Onebot</b> 协议</p>

<p>仓库地址：<a href="https://github.com/snowwolfair/fenglu-mouth">https://github.com/snowwolfair/fenglu-mouth</a></p>

<p style="color: #f39c12;">插件使用问题 / Bug反馈 / 建议 请 添加企鹅群 <b style="color: #bd73fa;">156529412</b> 或在仓库中发 <a href="https://github.com/snowwolfair/daynew/issues" >issue</a> </p>

<p>灵感来源于该梗图 </p>
<img src="https://github.com/snowwolfair/fenglu-mouth/blob/master/src/asset/chart.jpg" alt="chart" />

<h2>食用方法</h2>
<p> 在群内发送命令 <b style="color: #08b402ff;">elu</b> 或 <b style="color: #08b402ff;">查询俸禄</b> , 然后根据提示输入工资即可查询俸禄</p>
<hr>
<p> 目前仅支持使用 <b>https://www.goldapi.io</b> 提供的 api 源</p>
<p> 若需要使用其他 api 源，请通过 <b style="color: #bd73fa;">QQ</b> 或者 <b style="color: #bd73fa;">提交issue </b> 添加</p>
`;

export const Config: Schema = Schema.intersect([
  Schema.object({
    api: Schema.object({
      list: Schema.array(Schema.string().default("").description("api源key"))
        .default([])
        .description("api key列表"),
    }).description("贵金属源配置"),
  }),
  Schema.object({
    conver: Schema.object({
      dynasty: Schema.union(["秦朝", "东汉", "唐朝", "清朝"])
        .default("秦朝")
        .description(
          "朝代(仅明清使用银两结算俸禄，故只有选择清朝时才会计算对应的官职)",
        ),
      metal: Schema.union(["金", "银"]).default("金").description("金属"),
      currency: Schema.union(["人民币", "美元", "欧元", "英镑", "日元"])
        .default("人民币")
        .description("货币"),
    }).description("转化配置"),
  }),
]);

const transformDynasty = [
  {
    key: "秦朝",
    value: "QING",
    transform: 16.14,
  },
  {
    key: "东汉",
    value: "HAN",
    transform: 15,
  },
  {
    key: "唐朝",
    value: "TANG",
    transform: 40,
  },
  {
    key: "清朝",
    value: "MING",
    transform: 37.3,
  },
];

const transformMetal = [
  {
    key: "金价",
    value: "XAU",
  },
  {
    key: "银",
    value: "XAG",
  },
];

const transformCurrency = [
  {
    key: "人民币",
    value: "USD",
  },
  {
    key: "美元",
    value: "USD",
  },
  {
    key: "欧元",
    value: "EUR",
  },
  {
    key: "英镑",
    value: "GBP",
  },
  {
    key: "日元",
    value: "JPY",
  },
];

function QINGofficial(emolument: number) {
  if (emolument < 5.25) {
    return "不入流，担任职位：驿丞、闸官";
  }
  if (5.25 <= emolument && emolument < 5.52) {
    return "从九品，担任职位：典史、吏目";
  }
  if (5.52 <= emolument && emolument < 6.67) {
    return "正九品，担任职位：主簿、巡检";
  }
  if (6.67 <= emolument && emolument < 7.5) {
    return "正八品，担任职位：司务、县丞";
  }
  if (7.5 <= emolument && emolument < 10.0) {
    return "正七品，担任职位：知府、国子监助教";
  }
  if (10.0 <= emolument && emolument < 13.33) {
    return "正六品，担任职位：主事、翰林院修撰";
  }
  if (13.33 <= emolument && emolument < 17.5) {
    return "正五品，担任职位：御史、六部郎中";
  }
  if (17.5 <= emolument && emolument < 21.67) {
    return "正四品，担任职位：翰林院侍读、国子监祭酒";
  }
  if (21.67 <= emolument && emolument < 25.83) {
    return "正三品，担任职位：按察使、大理寺少卿";
  }
  if (25.83 <= emolument && emolument < 30.0) {
    return "正二品，担任职位：六部侍郎、内务府总管";
  }
  if (emolument >= 30.0) {
    return "正一品，担任职位：大学士、六部尚书";
  }
  return "您的工资为资深等级";
}

export function apply(ctx: Context, config) {
  // write your plugin here
  const APIList = config.api.list;
  const dynasty = transformDynasty.find(
    (item) => item.key == config.conver.dynasty,
  );
  const metal =
    transformMetal.find((item) => item.key == config.conver.metal)?.value ||
    "XAU";
  const currency =
    transformCurrency.find((item) => item.key == config.conver.currency)
      ?.value || "USD";

  ctx
    .command("elu")
    .action(async ({ session }) => {
      try {
        const userId = session.userId; // 用户 ID（字符串）
        const user = session.user;

        await session.send("请输入您的工资（/月）：");

        let salary = await session.prompt();
        if (!salary) return "输入超时。";

        if (isNaN(Number(salary))) return "请输入一个数字。";
        let salaryNum = Number(salary);

        if (config.conver.currency == "人民币") {
          salaryNum = Number((salaryNum / 7).toFixed(2));
        }

        const emolument = await sendEmolument(
          ctx,
          APIList,
          salaryNum,
          dynasty,
          metal,
          currency,
        );

        const official = QINGofficial(Number(emolument));
        if (metal == "XAG" && dynasty.value == "MING") {
          await session.send(
            `您在 ${dynasty.key}的 每月俸禄为:  ${emolument} 两 ${config.conver.metal}子\n官至${official}`,
          );
        } else {
          await session.send(
            `您在 ${dynasty.key}的 每月俸禄为:  ${emolument} 两 ${config.conver.metal}子`,
          );
        }
      } catch (err) {
        console.error("请求失败:", err);
      }
    })
    .alias("查询俸禄");
}

async function sendEmolument(
  ctx: Context,
  APIList?: string[],
  salaryNum?: number,
  dynasty?: any,
  metal?: string,
  currency?: string,
) {
  for (const api of APIList) {
    try {
      var url = "https://www.goldapi.io/api/" + metal + "/" + currency;

      const res = await ctx.http("get", url, {
        headers: {
          "x-access-token": api,
          "Content-Type": "application/json",
        },
      });
      const data = res.data;

      const { price_gram_24k } = data;

      let price = price_gram_24k.toFixed(2);

      price = (dynasty.transform * price).toFixed(2);

      const emolument = (salaryNum / price).toFixed(2);

      return emolument;
    } catch (err) {
      console.error("请求失败:", err);
    }
  }
  return "❌ 获取贵金属资讯失败，请稍后再试。";
}
