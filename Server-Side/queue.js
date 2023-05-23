class queue {
    constructor() {
        this.list = [];
    }

    getFirstItem = () => {
        return this.list[0];
    }

    getLastItem = async () => {
        return this.list[this.list.length -1];
    }

    getPosition = (item) => {
        for (const [index,value] of this.list.entries()) {
            if (item == value.session) {
                return index
            }
        };
    };

    checkExistance = async (item) => {
        for (const value of this.list) {
            if (item.session == value.session) {
                return true;
            }
        };
    } 

    addItem = (item) => {
        if (this.getFirstItem() == undefined) {
            this.list[0] = item;
        }
        else{
            this.list.push(item);
        }
    };

    removeFirstItem = async () => {
        this.list.shift();
    };

    removeItem = async (position) => {
        this.list.splice(position);
    };

    getLength = () => {
        return this.list.length;
    };

    getQueue = () => {
        return {length: this.getLength(), firstItem: this.getFirstItem()};
    };
};

module.exports.queue = queue;