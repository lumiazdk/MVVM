class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? this.isElementNode(el) : document.querySelector(el);
        this.vm = vm;
        if (this.el) {
            // 1、把这些真实的 Dom 移动到内存中，即 fragment（文档碎片）
            let fragment = this.node2fragment(this.el);

            // 2、将模板中的指令中的变量和 {{}} 中的变量替换成真实的数据
            this.compile(fragment);

            // 3、把编译好的 fragment 再塞回页面中
            this.el.appendChild(fragment);
        }
    }
    /**辅助方法 */
    isElementNode(node) {
        return node.nodeType === 1
    }
    isDirective(name) { //是否指令
        if (/\@(.*)/.test(name)) {
            return true
        } else if (name.includes("v-")) {
            return true;

        }
    }
    /**核心方法 */
    compileElement(node) {
        let attrs = node.attributes;
        Array.from(attrs).forEach(attr => {
            // 获取属性名，判断属性是否为指令，即含 v-
            let attrName = attr.name;

            if (this.isDirective(attrName)) {
                // 如果是指令，取到该属性值得变量在 data 中对应得值，替换到节点中
                let exp = attr.value;

                // 取出方法名
                let [, type] = attrName.split("-");
                console.log(type)

                // 调用指令对应得方法
                CompileUtil[type](node, this.vm, exp);
            }
        });
    }
    compileText(node) {
        // 获取文本节点的内容

        let exp = node.textContent;
        // 创建匹配 {{}} 的正则表达式
        let reg = /\{\{([^}]+)\}\}/g;
        // 如果存在 {{}} 则使用 text 指令的方法
        if (reg.test(exp)) {
            CompileUtil["text"](node, this.vm, exp);
        }
    }
    compile(fragment) {
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            if (this.isElementNode(node)) {
                // 递归编译子节点
                this.compile(node);

                // 编译元素节点的方法
                this.compileElement(node);
            } else {
                this.compileText(node)
            }
        })
    }
    node2fragment(el) {
        // 创建文档碎片
        let fragment = document.createDocumentFragment();
        // 第一个子节点
        let firstChild;

        // 循环取出根节点中的节点并放入文档碎片中
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}