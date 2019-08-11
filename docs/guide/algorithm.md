# 算法面试题

点击关注本[公众号](#公众号)获取文档最新更新,并可以领取配套于本指南的 **《前端面试手册》** 以及**最标准的简历模板**.

算法相关的题在前端面试中的比重越来越高,当然最有效的方法是去LeetCode上刷题,关于JavaScript版的LeetCode解题思路可以参考此项目[leetcode题解，记录自己的leetcode解题之路](https://github.com/azl397985856/leetcode)

## 如何分析时间复杂度?

当问题规模即要处理的数据增长时，基本操作要重复执行的次数必定也会增长，那么我们关心地是这个执行次数以什么样的数量级增长。

我们用大O表示法表示一下常见的时间复杂度量级：

常数阶O(1)
线性阶O(n)
对数阶O(logn)
线性对数阶O(nlogn)
平方阶O(n²)

当然还有指数阶和阶乘阶这种非常极端的复杂度量级，我们就不讨论了。

![2019-06-17-14-10-02]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/c8f312b9fb2d0c8d87af05a04ff208ba.png)

#### O(1)

传说中的常数阶的复杂度，这种复杂度无论数据规模n如何增长，计算时间是不变的。

举一个简单的例子：

```js
const increment = n => n++
```

不管n如何增长，都不会影响到这个函数的计算时间，因此这个代码的时间复杂度都是O(1)。

#### O(n)

线性复杂度，随着数据规模n的增长，计算时间也会随着n线性增长。

典型的O(n)的例子就是线性查找。

```js

const linearSearch = (arr, target) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
    return i
  }
}
  return -1
}

```

线性查找的时间消化与输入的数组数量n成一个线性比例，随着n规模的增大，时间也会线性增长。

#### O(logn)

对数复杂度，随着问题规模n的增长，计算时间也会随着n对数级增长。

典型的例子是二分查找法。

```js
functions binarySearch(arr, target) {
	let max = arr.length - 1
	let min = 0
	while (min <= max) {
		let mid = Math.floor((max + min) / 2)
		if (target < arr[mid]) {
			max = mid - 1
		} else if (target > arr[mid]) {
			min = mid + 1
		} else {
			return mid
		}
	}
	return -1
}
```

在二分查找法的代码中，通过while循环，成 2 倍数的缩减搜索范围，也就是说需要经过 log2^n 次即可跳出循环。

事实上在实际项目中，`O(logn)`是一个非常好的时间复杂度，比如当`n=100`的数据规模时，二分查找只需要7次，线性查找需要100次，这对于计算机而言差距不大，但是当有10亿的数据规模的时候，二分查找依然只需要30次，而线性查找需要惊人的10亿次，`O(logn)`时间复杂度的算法随着数据规模的增大，它的优势就越明显。

#### O(nlogn)

线性对数复杂度，随着数据规模n的增长，计算时间也会随着n呈线性对数级增长。

这其中典型代表就是归并排序，我们会在对应小节详细分析它的复杂度。

```js
const mergeSort = array => {
	const len = array.length
	if (len < 2) {
		return len
	}

	const mid = Math.floor(len / 2)
	const first = array.slice(0, mid)
	const last = array.slice(mid)

	return merge(mergeSort(fist), mergeSort(last))

	function merge(left, right) {
		var result = [];
		while (left.length && right.length) {
			if (left[0] <= right[0]) {
				result.push(left.shift());
			} else {
				result.push(right.shift());
			}
		}
	
		while (left.length)
			result.push(left.shift());
	
		while (right.length)
			result.push(right.shift());
		return result;
	}
}
```

#### O(n²)

平方级复杂度，典型情况是当存在双重循环的时候，即把 O(n) 的代码再嵌套循环一遍，它的时间复杂度就是 O(n²) 了，代表应用是冒泡排序算法。

```js
    function bubleSort(arra){

        var temp;

        for(var i=0;i<arra.length;i++){
            for(var j=0;j<arra.length-i-1;j++){
                if(arra[j]>arra[j+1]){
                    temp=arra[j];
                    arra[j]=arra[j+1];
                    arra[j+1]=temp;
                }
            }
        };
    return arra;
    }
```

## 排序算法

排序算法有很多种,我们只讲最具代表性的几种算法： 冒泡排序、希尔排序、归并排序、快速排序

![2019-08-07-00-04-56]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/5cf4f5068302e59c8231c18ad9680f10.png)

排序算法主体内容采用的是[十大经典排序算法总结（JavaScript描述）](https://github.com/damonare/Sorts),更详细的内容可以移步,因为作者的内容与教科书上的内容有较大冲突,因此我们重写了**快速排序**部分的内容,以教科书为准,因此建议重点读一下本文的快速排序部分.

### 冒泡排序（Bubble Sort）

实现思路:

1. 比较相邻的元素。如果第一个比第二个大，就交换他们两个。

2. 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。

3. 针对所有的元素重复以上的步骤，除了最后一个。

4. 持续每次对越来越少的元素重复上面的步骤，直到没有任何一对数字需要比较。

实现:

```js
function bubbleSort(arr) {
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len - 1 - i; j++) {
            if (arr[j] > arr[j+1]) {
                var temp = arr[j+1];
                arr[j+1] = arr[j];
                arr[j] = temp;
            }
        }
    }
    return arr;
}

```

改进1: 设置一标志性变量pos,用于记录每趟排序中最后一次进行交换的位置。由于pos位置之后的记录均已交换到位,故在进行下一趟排序时只要扫描到pos位置即可。

```javascript

function bubbleSort2(arr) {
    console.time('改进后冒泡排序耗时');
    var i = arr.length-1;  //初始时,最后位置保持不变
    while ( i> 0) {
        var pos= 0; //每趟开始时,无记录交换
        for (var j= 0; j< i; j++)
            if (arr[j]> arr[j+1]) {
                pos= j; //记录交换的位置
                var tmp = arr[j]; arr[j]=arr[j+1];arr[j+1]=tmp;
            }
        i= pos; //为下一趟排序作准备
     }
     console.timeEnd('改进后冒泡排序耗时');
     return arr;
}
```

改进2: 传统冒泡排序中每一趟排序操作只能找到一个最大值或最小值,我们考虑利用在每趟排序中进行正向和反向两遍冒泡的方法一次可以得到两个最终值(最大者和最小者) , 从而使排序趟数几乎减少了一半。

```javascript
function bubbleSort3(arr3) {
    var low = 0;
    var high= arr.length-1; //设置变量的初始值
    var tmp,j;
    console.time('2.改进后冒泡排序耗时');
    while (low < high) {
        for (j= low; j< high; ++j) //正向冒泡,找到最大者
            if (arr[j]> arr[j+1]) {
                tmp = arr[j]; arr[j]=arr[j+1];arr[j+1]=tmp;
            }
        --high;                 //修改high值, 前移一位
        for (j=high; j>low; --j) //反向冒泡,找到最小者
            if (arr[j]<arr[j-1]) {
                tmp = arr[j]; arr[j]=arr[j-1];arr[j-1]=tmp;
            }
        ++low;                  //修改low值,后移一位
    }
    console.timeEnd('2.改进后冒泡排序耗时');
    return arr3;
}
```

动画:

![](https://user-gold-cdn.xitu.io/2016/11/30/f427727489dff5fcb0debdd69b478ecf?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

### 希尔排序(Shell Sort）

> 1959年Shell发明；
第一个突破O(n^2)的排序算法；是简单插入排序的改进版；它与插入排序的不同之处在于，它会优先比较距离较远的元素。希尔排序又叫缩小增量排序

#### 算法简介

> 希尔排序的核心在于间隔序列的设定。既可以提前设定好间隔序列，也可以动态的定义间隔序列。动态定义间隔序列的算法是《算法（第4版》的合著者Robert Sedgewick提出的。

#### 算法描述和实现

先将整个待排序的记录序列分割成为若干子序列分别进行直接插入排序，具体算法描述：

1. 选择一个增量序列t1，t2，…，tk，其中ti>tj，tk=1；
2. 按增量序列个数k，对序列进行k 趟排序；
3. 每趟排序，根据对应的增量ti，将待排序列分割成若干长度为m 的子序列，分别对各子表进行直接插入排序。仅增量因子为1 时，整个序列作为一个表来处理，表长度即为整个序列的长度。

**Javascript代码实现：**

```javascript
function shellSort(arr) {
    var len = arr.length,
        temp,
        gap = 1;
    console.time('希尔排序耗时:');
    while(gap < len/5) {          //动态定义间隔序列
        gap =gap*5+1;
    }
    for (gap; gap > 0; gap = Math.floor(gap/5)) {
        for (var i = gap; i < len; i++) {
            temp = arr[i];
            for (var j = i-gap; j >= 0 && arr[j] > temp; j-=gap) {
                arr[j+gap] = arr[j];
            }
            arr[j+gap] = temp;
        }
    }
    console.timeEnd('希尔排序耗时:');
    return arr;
}
var arr=[3,44,38,5,47,15,36,26,27,2,46,4,19,50,48];
console.log(shellSort(arr));//[2, 3, 4, 5, 15, 19, 26, 27, 36, 38, 44, 46, 47, 48, 50]

```

**希尔排序图示（图片来源网络）：**

![2019-08-07-00-16-36]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/6974f74ff2e54223d60693f04759ff7f.png)

#### 算法分析

* 最佳情况：T(n) = O(nlog2 n)
* 最坏情况：T(n) = O(nlog2 n)
* 平均情况：T(n) =O(nlog n)

### 归并排序（Merge Sort）

> 和选择排序一样，归并排序的性能不受输入数据的影响，但表现比选择排序好的多，因为始终都是O(n log n）的时间复杂度。代价是需要额外的内存空间。

#### 算法简介

> 归并排序是建立在归并操作上的一种有效的排序算法。该算法是采用分治法（Divide and Conquer）的一个非常典型的应用。归并排序是一种稳定的排序方法。将已有序的子序列合并，得到完全有序的序列；即先使每个子序列有序，再使子序列段间有序。若将两个有序表合并成一个有序表，称为2-路归并。

#### 算法描述和实现

具体算法描述如下：

1. 把长度为n的输入序列分成两个长度为n/2的子序列；
2. 对这两个子序列分别采用归并排序；
3. 将两个排序好的子序列合并成一个最终的排序序列。

**Javscript代码实现:**

```javascript
function mergeSort(arr) {  //采用自上而下的递归方法
    var len = arr.length;
    if(len < 2) {
        return arr;
    }
    var middle = Math.floor(len / 2),
        left = arr.slice(0, middle),
        right = arr.slice(middle);
    return merge(mergeSort(left), mergeSort(right));
}

function merge(left, right)
{
    var result = [];
    console.time('归并排序耗时');
    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());
    console.timeEnd('归并排序耗时');
    return result;
}
var arr=[3,44,38,5,47,15,36,26,27,2,46,4,19,50,48];
console.log(mergeSort(arr));

```

**归并排序动图演示:**

![这里写图片描述](https://user-gold-cdn.xitu.io/2016/11/29/33d105e7e7e9c60221c445f5684ccfb6?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

#### 算法分析

- 最佳情况：T(n) = O(n)
- 最差情况：T(n) = O(nlogn)
- 平均情况：T(n) = O(nlogn)

### 快速排序（Quick Sort）

#### 算法简介

快速排序的基本思想：通过一趟排序将待排记录分隔成独立的两部分，其中一部分记录的关键字均比另一部分的关键字小，则可分别对这两部分记录继续进行排序，以达到整个序列有序。

#### 算法描述和实现

1.从数组中选择中间一项作为主元；

2.创建两个指针，左边一个指向数组的第一项，右边指向数组最后一项。移动左指针直到我们找到一个比主元大的元素，接着，移动右指针直到找到一个比主元小的元素。然后交换它们，重复这个过程，直到左指针超过了右指针。这个过程是的比主元小的值都排在了主元之前，而比主元大的值都排在了主元之后，这一步叫划分操作。

3.接着，算法对划分的小数组（较主元小的值组成的子数组，以及较主元大的值组成的子数组）重复之前的两个步骤，直至数组以完全排序。

```js
// 快速排序
const quickSort = (function() {
	// 默认状态下的比较函数
	function compare(a, b) {
		if (a === b) {
			return 0
		}
		return a < b ? -1 : 1
	}

	function swap(array, a, b) {
		[array[a], array[b]] = [array[b], array[a]]
	}

	// 分治函数
	function partition(array, left, right) {
		// 用index取中间值而非splice
		const pivot = array[Math.floor((right + left) / 2)]
		let i = left
		let j = right

		while (i <= j) {
			while (compare(array[i], pivot) === -1) {
				i++
			}
			while (compare(array[j], pivot) === 1) {
				j--
			}
			if (i <= j) {
				swap(array, i, j)
				i++
				j--
			}
		}
		return i
	}
	// 快排函数
	function quick(array, left, right) {
		let index
		if (array.length > 1) {
			index = partition(array, left, right)
			if (left < index - 1) {
				quick(array, left, index - 1)
			}
			if (index < right) {
				quick(array, index, right)
			}
		}
		return array
	}
	return function quickSort(array) {
		return quick(array, 0, array.length - 1)
	}
})()
```

![](https://user-gold-cdn.xitu.io/2016/11/29/dd9dc195a7331351671fe9ac4f7d5aa4?imageView2/0/w/1280/h/960/format/webp/ignore-error/1)

#### 算法分析

最佳情况：T(n) = O(nlogn)
最差情况：T(n) = O(n2)
平均情况：T(n) = O(nlogn)

## 查找算法

### 二分查找法

#### 算法简介

折半查找算法要求查找表的数据是线性结构存储，还要求查找表中的顺序是由小到大排序（由大到小排序）

#### 算法思路及实现

1. 首先设两个指针，low和height，表示最低索引和最高索引
2. 然后取中间位置索引middle，判断middle处的值是否与所要查找的数相同，相同则结束查找，middle处的值比所要查找的值小就把low设为middle+1，如果middle处的值比所要查找的值大就把height设为middle-1
3. 然后再新区间继续查到，直到找到或者low>height找不到所要查找的值结束查找

```js
functions binarySearch(arr, target) {
	let max = arr.length - 1
	let min = 0
	while (min <= max) {
		let mid = Math.floor((max + min) / 2)
		if (target < arr[mid]) {
			max = mid - 1
		} else if (target > arr[mid]) {
			min = mid + 1
		} else {
			return mid
		}
	}
	return -1
}
```

#### 算法分析

最佳情况：T(n) = O(logn)
最差情况：T(n) = O(logn)
平均情况：T(n) = O(logn)

### 线性查找

#### 算法简介及实现

线性查找很简单,只需要进行简单的遍历即可.

```js
const linearSearch = (arr, target) => {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] === target) {
			return i
		}
	}
	return -1
}
```

#### 算法分析

最佳情况：T(n) = O(n)
最差情况：T(n) = O(n)
平均情况：T(n) = O(n)

---

## 公众号

想要实时关注笔者最新的文章和最新的文档更新请关注公众号**程序员面试官**,后续的文章会优先在公众号更新.

**简历模板:** 关注公众号回复「模板」获取

**《前端面试手册》:** 配套于本指南的突击手册,关注公众号回复「fed」获取

![2019-08-12-03-18-41]( https://xiaomuzhu-image.oss-cn-beijing.aliyuncs.com/d846f65d5025c4b6c4619662a0669503.png)
