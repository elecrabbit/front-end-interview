const createStore = function (initState, reducer) {
    let state = initState;
    const listeners = [];

    /**
     * 订阅
     * @param {func} listener 订阅者,为一个回调函数
     */
    function subscribe(listener) {
        listeners.push(listener);
    }

    function changeState(action) {
        
        // 我们通过这个计算函数进行计算改变状态
        state = reducer(state, action)
        /**
         * 当状态发生变化,通知订阅者
         */
        for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            listener();
        }
    }

    /**
     * 获取全局状态
     */
    function getState() {
        return state;
    }

    return {
        subscribe,
        changeState,
        getState
    }
}


const increment = 'INCREMENT'

const incrementAction = () => ({
    type: increment
})

function counter(state, action) {
    switch (action.type) {
        case 'INCREMENT':
          return {
            ...state,
            count: state.count + 1
          }
        default:
          return state;
      }
}

const initState = {
    count: 0
}

const store = createStore(initState, counter)

const s = store.getState()

store.subscribe(() => {
    let state = store.getState();
    console.log(state.count); // 1
})

store.changeState(incrementAction())
store.changeState(incrementAction())

