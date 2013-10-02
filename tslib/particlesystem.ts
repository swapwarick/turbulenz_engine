// Copyright (c) 2012 Turbulenz Limited

/*global
Float32Array: false
Uint8Array: false
Uint16Array: false
Uint32Array: false
VMath: false
*/

"use strict";

// Array<number> | Float32Array
interface FloatArray
{
    [index: number]: number;
    length: number;
}

//
// TextureEncode
//
// Used to encode/decode floats/vectors into pixel values for texture storage.
// Analogous to methods of particles-commmon.cgh
//
class TextureEncode
{
    static version = 1;

    // f in [0,1) map to 8bit integer value.
    // Note: Can represent 0.5 exactly.
    static encodeByteUnsignedFloat(f: number): number
    {
        return f <= 0.0 ? 0x00
             : f >= 1.0 ? 0xff
             : ((f * 256.0) | 0);
    }
    static decodeByteUnsignedFloat(v: number): number
    {
        return (v / 256.0);
    }

    // f in [-1,1) map to 8bit integer value.
    // Note: Can represent 0.0 exactly.
    static encodeByteSignedFloat(f: number): number
    {
        return TextureEncode.encodeByteUnsignedFloat((f + 1.0) * 0.5);
    }
    static decodeByteSignedFloat(v: number): number
    {
        return (TextureEncode.decodeByteUnsignedFloat(v) * 2.0) - 1.0;
    }

    // f in [0,1) map to 16bit integer value.
    // Note: Can represent 0.5 exactly.
    static encodeHalfUnsignedFloat(f: number): number
    {
        if (f <= 0.0)
        {
            return 0x0000;
        }
        else if (f >= 1.0)
        {
            return 0xffff;
        }
        else
        {
            var x = ((f * 256.0) % 1.0) * 256.0;
            var y = (f % 1.0) * 256.0;
            y -= x / 256.0;
            return (x | (y << 8));
        }
    }
    static decodeHalfUnsignedFloat(v: number): number
    {
        var x = (v & 0xff);
        var y = (v >>> 8);
        return (x / 65536.0) + (y / 256.0);
    }

    // f in [-1,1) map to 16bit integer value.
    // Note: Can represent 0.0 exactly.
    static encodeHalfSignedFloat(f: number): number
    {
        return TextureEncode.encodeHalfUnsignedFloat((f + 1.0) * 0.5);
    }
    static decodeHalfSignedFloat(v: number): number
    {
        return (TextureEncode.decodeHalfUnsignedFloat(v) * 2.0) - 1.0;
    }

    // f in [0,1) map to 32bit integer value.
    // Note: Can represent 0.5 exactly.
    static encodeUnsignedFloat(f: number): number
    {
        if (f <= 0.0)
        {
            return 0x00000000;
        }
        else if (f >= 1.0)
        {
            return -1; // 0xffffffff does not give -1 in JS due to not having a real int32 type.
        }
        else
        {
            var x = ((f * 16777216.0) % 1.0) * 256.0;
            var y = ((f * 65536.0) % 1.0) * 256.0;
            var z = ((f * 256.0) % 1.0) * 256.0;
            var w = (f % 1.0) * 256.0;
            w -= z / 256.0;
            z -= y / 256.0;
            y -= x / 256.0;
            return (x | (y << 8) | (z << 16) | (w << 24));
        }
    }
    static decodeUnsignedFloat(v: number): number
    {
        var x = (v & 0xff);
        var y = (v >>> 8) & 0xff;
        var z = (v >>> 16) & 0xff;
        var w = (v >>> 24);
        return (x / 4294967296.0) + (y / 16777216.0) + (z / 65536.0) + (w / 256.0);
    }

    // f in [-1,1) map to 32bit integer value.
    // Note: Can represent 0.0 exactly.
    static encodeSignedFloat(f: number): number
    {
        return TextureEncode.encodeUnsignedFloat((f + 1.0) * 0.5);
    }
    static decodeSignedFloat(v: number): number
    {
        return (TextureEncode.decodeUnsignedFloat(v) * 2.0) - 1.0;
    }

    // v in [0,1]*4 map to 32bit integer value.
    // Note: Cannot represent 0.5's exactly, but does encode 1.0's.
    static encodeUnsignedFloat4(v: FloatArray): number
    {
        var x = v[0];
        var y = v[1];
        var z = v[2];
        var w = v[3];
        x = (x < 0.0 ? 0.0 : x > 1.0 ? 1.0 : x) * 0xff;
        y = (y < 0.0 ? 0.0 : y > 1.0 ? 1.0 : y) * 0xff;
        z = (z < 0.0 ? 0.0 : z > 1.0 ? 1.0 : z) * 0xff;
        w = (w < 0.0 ? 0.0 : w > 1.0 ? 1.0 : w) * 0xff;
        return (x | (y << 8) | (z << 16) | (w << 24));
    }
    static decodeUnsignedFloat4(v: number, dst?: FloatArray): FloatArray
    {
        if (dst === undefined)
        {
            dst = VMath.v4BuildZero();
        }
        dst[0] = (v & 0xff) / 0xff;
        dst[1] = ((v >>> 8) & 0xff) / 0xff;
        dst[2] = ((v >>> 16) & 0xff) / 0xff;
        dst[3] = (v >>> 24) / 0xff;
        return dst;
    }

    // v in [0,1)*2 map to 32bit integer value.
    // Note: Can represent 0.5's exactly.
    static encodeUnsignedFloat2(v: FloatArray): number
    {
        var x = TextureEncode.encodeHalfUnsignedFloat(v[0]);
        var y = TextureEncode.encodeHalfUnsignedFloat(v[1]);
        return (x | (y << 16));
    }
    static decodeUnsignedFloat2(v: number, dst?: FloatArray): FloatArray
    {
        if (dst === undefined)
        {
            dst = VMath.v2BuildZero();
        }
        dst[0] = TextureEncode.decodeHalfUnsignedFloat(v & 0xffff);
        dst[1] = TextureEncode.decodeHalfUnsignedFloat(v >>> 16);
        return dst;
    }

    // v in [-1,1)*2 map to 32bit integer value.
    // Note: Can represent 0.0's exactly.
    static encodeSignedFloat2(v: FloatArray): number
    {
        var x = TextureEncode.encodeHalfSignedFloat(v[0]);
        var y = TextureEncode.encodeHalfSignedFloat(v[1]);
        return (x | (y << 16));
    }
    static decodeSignedFloat2(v: number, dst?: FloatArray): FloatArray
    {
        if (dst === undefined)
        {
            dst = VMath.v2BuildZero();
        }
        dst[0] = TextureEncode.decodeHalfSignedFloat(v & 0xffff);
        dst[1] = TextureEncode.decodeHalfSignedFloat(v >>> 16);
        return dst;
    }
}


//
// SizeTree (private type)
//
// A 2D AABB Tree working only with the 'sizes' of boxes rather than extents
// Implemented differently from BoxTree/AABBTree as this tree does not need
// to support overlapping queries, but only a search whose main characteristic
// is to discard AABB's that are too small.
//
interface SizeTreeNode<T>
{
    // Size and associated data
    w: number;
    h: number;

    // leaf only
    data: T;

    // Tree links and sub-tree height
    parent: SizeTreeNode<T>;
    height: number;

    // non-leaf only
    child : Array<SizeTreeNode<T>>; // Pair

    // Tree constraints:
    //
    // data === null <=> child !== null                        (only leaves have data)
    // child !== null => child.length = 2 and they're non-null (every non-leaf has exactly 2 children)
    // height = 1 + max(childs height's)                       (height is valid)
    // (w,h) >= childs (w,h) (considered seperately)           (nodes encompass their children)
    // (w,h) is minimal                                        (nodes are as small as possible to encompass children)
    // abs(child1.height - child2.height) in {-1,0,1}          (tree is balanced)
}
class SizeTree<T>
{
    private root: SizeTreeNode<T>;

    constructor()
    {
        this.root = null;
    }

    private static gen<T>(data: T, w: number, h: number): SizeTreeNode<T>
    {
        return {
            w: w,
            h: h,
            data: data,
            parent: null,
            child: null,
            height: 0
        };
    }

    insert (data: T, w: number, h: number): SizeTreeNode<T>
    {
        var leaf = SizeTree.gen(data, w, h);
        if (!this.root)
        {
            this.root = leaf;
        }
        else
        {
            var node = this.root;
            while (node.child)
            {
                var child0 = node.child[0];
                var child1 = node.child[1];

                // cost of creating a new parent for this node and leaf.
                // cost hueristic defined by sum of node dimensions.
                var ncost = (node.w > leaf.w ? node.w : leaf.w) +
                            (node.h > leaf.h ? node.h : leaf.h);
                // cost of pushing leaf further down the tree.
                var icost = ncost - (node.w + node.h);
                // cost of descending into a particular child.
                var cost0 = (child0.w > leaf.w ? child0.w : leaf.w) +
                            (child0.h > leaf.h ? child0.h : leaf.h) + icost;
                var cost1 = (child1.w > leaf.w ? child1.w : leaf.w) +
                            (child1.h > leaf.h ? child1.h : leaf.h) + icost;
                if (child0.child)
                {
                    cost0 -= (child0.w + child0.h);
                }
                if (child1.child)
                {
                    cost1 -= (child1.w + child1.h);
                }

                if (ncost < cost0 && ncost < cost1)
                {
                    break;
                }
                else
                {
                    // Descend into cheaper child.
                    node = (cost0 < cost1) ? child0 : child1;
                }
            }

            var sibling = node;

            // Create a new parent for sibling and leaf
            var oparent = sibling.parent;
            var nparent = SizeTree.gen(null, (leaf.w > sibling.w ? leaf.w : sibling.w),
                                             (leaf.h > sibling.h ? leaf.h : sibling.h));
            nparent.parent = oparent;
            nparent.height = sibling.height + 1;
            sibling.parent = nparent;
            leaf.parent    = nparent;
            nparent.child  = [sibling, leaf];

            if (oparent)
            {
                // sibling is not the root of tree, set its parent's child ref.
                oparent.child[oparent.child[0] === sibling ? 0 : 1] = nparent;
            }
            else
            {
                // sibiling is the root of tree, set new root.
                this.root = nparent;
            }

            // Adjust ancestor bounds and balance tree
            this.filterUp(nparent);
        }
        return leaf;
    }

    remove(leaf: SizeTreeNode<T>): void
    {
        if (leaf === this.root)
        {
            this.root = null;
        }
        else
        {
            var parent  = leaf.parent;
            var gparent = parent.parent;
            var sibling = parent.child[parent.child[0] === leaf ? 1 : 0];

            if (gparent)
            {
                // destroy parent and connect sibling and gparent.
                gparent.child[gparent.child[0] === parent ? 0 : 1] = sibling;
                sibling.parent = gparent;

                // Adjust ancestor bounds and balance tree
                this.filterUp(gparent);
            }
            else
            {
                this.root = sibling;
                sibling.parent = null;
            }
        }
    }

    private filterUp(node: SizeTreeNode<T>)
    {
        while (node)
        {
            node = this.balance(node);

            var child0 = node.child[0];
            var child1 = node.child[1];
            node.height = 1 + (child0.height > child1.height ? child0.height : child1.height);
            node.w      = (child0.w > child1.w ? child0.w : child1.w);
            node.h      = (child0.h > child1.h ? child0.h : child1.h);

            node = node.parent;
        }
    }

    private balance(node: SizeTreeNode<T>)
    {
        if (!node.child || node.height < 2)
        {
            // sub tree is already balanced.
            return node;
        }
        else
        {
            var child0 = node.child[0];
            var child1 = node.child[1];

            var balance = child1.height - child0.height;
            if (balance >= -1 && balance <= 1)
            {
                // sub tree is already balanced.
                return node;
            }

            // Decide which direction to rotate sub-tree.
            var rotate, other, childN;
            if (balance > 0)
            {
                rotate = child1;
                other  = child0;
                childN = 1;
            }
            else
            {
                rotate = child0;
                other  = child1;
                childN = 0;
            }

            // Rotate sub-tree.
            var grandchild0 = rotate.child[0];
            var grandchild1 = rotate.child[1];

            // swap node with rotate
            rotate.child[1 - childN] = node;
            rotate.parent = node.parent;
            node.parent = rotate;

            // make node's old parent point down to rotate
            // or set new root if appropriate.
            if (rotate.parent)
            {
                rotate.parent.child[rotate.parent.child[0] === node ? 0 : 1] = rotate;
            }
            else
            {
                this.root = rotate;
            }

            // Decide which grandchild to swing.
            var pivot, swing;
            if (grandchild0.height > grandchild1.height)
            {
                pivot = grandchild0;
                swing = grandchild1;
            }
            else
            {
                pivot = grandchild1;
                swing = grandchild0;
            }

            // Swing
            rotate.child[childN] = pivot;
            node.child[childN] = swing;
            swing.parent = node;

            // Recompute bounds and heights
            node.w   = (other.w > swing.w ? other.w : swing.w);
            node.h   = (other.h > swing.h ? other.h : swing.h);
            rotate.w = (node.w  > pivot.w ? node.w  : pivot.w);
            rotate.h = (node.h  > pivot.h ? node.h  : pivot.h);
            node.height   = 1 + (other.height > swing.height ? other.height : swing.height);
            rotate.height = 1 + (node.height  > pivot.height ? node.height  : pivot.height);

            return rotate;
        }
    }

    // Depth first traversal of tree executing lambda for every node
    traverse(lambda: (node: SizeTreeNode<T>) => boolean): void
    {
        // TODO, don't use a temporary for stack
        var stack = [];
        if (this.root)
        {
            stack.push(this.root);
        }
        while (stack.length !== 0)
        {
            var node = stack.pop();
            if (lambda(node) && node.child)
            {
                stack.push(node.child[0]);
                stack.push(node.child[1]);
            }
        }
    }

    // Depth first traversal of tree, searching for a minimum
    // cost leaf of the tree, discarding subtrees that are not
    // at least as wide, and as tall as the given (w,h).
    //
    // Cost function should return null for zero-cost leaf (upon
    // which search will terminate), or any real number.
    searchBestFit(w: number, h: number, getCost: (w: number, h: number, data: T) => number): SizeTreeNode<T>
    {
        // TODO, don't use a temporary for stack
        var stack = [];
        if (this.root)
        {
            stack.push(this.root);
        }

        var minCost = Number.POSITIVE_INFINITY;
        var minLeaf = null;
        while (stack.length !== 0)
        {
            var node = stack.pop();
            if (node.w >= w && node.h >= h)
            {
                if (node.child)
                {
                    stack.push(node.child[0]);
                    stack.push(node.child[1]);
                }
                else
                {
                    var cost = getCost(w, h, node.data);
                    if (cost === null)
                    {
                        // Early exit, got a best fit
                        minLeaf = node;
                        break;
                    }
                    else if (cost < minCost)
                    {
                        minCost = cost;
                        minLeaf = node;
                    }
                }
            }
        }
        return minLeaf;
    }
}

//
// OnlineTexturePacker
//
// Uses SizeTree to implement a reasonably performant (in terms of packing density) online packing
// algorithm designed for texture packing into shared storage where 'free-ing' allocated regions of
// shared textures is not required and fragmentation as a result can be ignored allowing high performance.
//
// Although intended for use with integer w/h (in which case x/y would also be integer in results)
// There is no reason for this not to be used with any finite strictly positive w/h
//
// The type actually returned from public API:
interface PackedRect
{
    // x,y,w,h of rectangle relative to bin.
    x: number;
    y: number;
    w: number;
    h: number;
    // bin index [0,N) for which texture is used.
    bin: number;
}
class OnlineTexturePacker
{
    // Store for optimised search of available free-space in bins
    private free: SizeTree<PackedRect>;
    // Set of bins (shared textures) 'allocated' for storage by packer
    // (readonly from public api side)
    bins: Array<PackedRect>;

    // Maximum dimensions of a bin.
    // READONLY!!
    maxWidth: number;
    maxHeight: number;

    constructor(maxWidth: number, maxHeight: number)
    {
        this.free = new SizeTree<PackedRect>();
        this.bins = [];
        this.maxWidth = maxWidth;
        this.maxHeight = maxHeight;
    }

    private releaseSpace(bin, x, y, w, h)
    {
        if (w !== 0 && h !== 0)
        {
            var rect = {
                x: x,
                y: y,
                w: w,
                h: h,
                bin: bin
            };
            this.free.insert(rect, w, h);
        }
    }

    // Cost of assigning (w,h) into given rectangle.
    //
    // Assign costs that primarily aims to assign exactly to a given empt space.
    // Failing that, we assign a low cost for stores that waste only a very small
    // amount of space, and a low cost for stores into much larger rectangles with
    // high costs inbetween.
    private static costFit(w, h, rect)
    {
        // Exact fit (terminate early)
        if (rect.w === w && rect.h === h)
        {
            return null;
        }
        else
        {
            var fw = rect.w / w;
            var fh = rect.h / h;
            var cw = Math.sin((1 - fw*fw) * Math.PI);
            var ch = Math.sin((1 - fh*fh) * Math.PI);
            return (cw * ch) + (cw + ch);
        }
    }

    // Pack (w,h) into texture store, possibly 'resizing' the virtual size of
    // a bin up to (maxWidth,maxHeight), and possibly 'creating' a new virtual texture (bin)
    pack(w: number, h: number): PackedRect
    {
        if (w > this.maxWidth || h > this.maxHeight)
        {
            return null;
        }

        var bin = 0;
        var node = this.free.searchBestFit(w, h, OnlineTexturePacker.costFit);
        if (node)
        {
            this.free.remove(node);
            return this.split(node.data, w, h);
        }
        else
        {
            return this.grow(w, h);
        }
    }

    private split(rect: PackedRect, w: number, h: number): PackedRect
    {
        // I have no idea why this choice of branch condition works as well as it does...
        if ((rect.w - w) < (rect.h - h))
        {
            this.releaseSpace(rect.bin, rect.x, rect.y + h, rect.w, rect.h - h);
            this.releaseSpace(rect.bin, rect.x + w, rect.y, rect.w - w, h);
        }
        else
        {
            this.releaseSpace(rect.bin, rect.x, rect.y + h, w, rect.h - h);
            this.releaseSpace(rect.bin, rect.x + w, rect.y, rect.w - w, rect.h);
        }
        return {
            x: rect.x,
            y: rect.y,
            w: w,
            h: h,
            bin: rect.bin
        };
    }

    private static nearPow2Geq(x)
    {
        return (1 << Math.ceil(Math.log(x) / Math.log(2)));
    }

    private grow(w, h, bin = 0): PackedRect
    {
        if (bin >= this.bins.length)
        {
            this.bins.push({
                x: 0,
                y: 0,
                w: 0,
                h: 0,
                bin: bin
            });
        }

        var rect = this.bins[bin];
        var canGrowRight = (rect.x + rect.w + w) <= this.maxWidth;
        var canGrowDown  = (rect.y + rect.h + h) <= this.maxHeight;

        // We decide which direction to grow, trying to avoid narrow regions being created.
        // But avoid going over a power of 2 boundary if we can avoid it.
        var wExpand = OnlineTexturePacker.nearPow2Geq(rect.w) !== OnlineTexturePacker.nearPow2Geq(rect.w + w);
        var hExpand = OnlineTexturePacker.nearPow2Geq(rect.h) !== OnlineTexturePacker.nearPow2Geq(rect.h + h);
        var shouldGrowRight = (wExpand === hExpand) ? (Math.abs(rect.h - h) > Math.abs(rect.w - w)) : (!wExpand);

        if (canGrowRight && shouldGrowRight)
        {
            return this.growRight(rect, w, h);
        }
        else if (canGrowDown)
        {
            return this.growDown(rect, w, h);
        }
        else
        {
            return this.grow(w, h, bin + 1);
        }
    }

    private growRight(rect: PackedRect, w, h): PackedRect
    {
        var fit = {
            x: rect.x + rect.w,
            y: rect.y,
            w: w,
            h: h,
            bin : rect.bin
        };
        if (h < rect.h)
        {
            this.releaseSpace(rect.bin, rect.x + rect.w, rect.y + h, w, rect.h - h);
        }
        else
        {
            this.releaseSpace(rect.bin, rect.x, rect.y + rect.h, rect.w, h - rect.h);
            rect.h = h;
        }
        rect.w += w;
        return fit;
    }
    private growDown(rect: PackedRect, w, h): PackedRect
    {
        var fit = {
            x: rect.x,
            y: rect.y + rect.h,
            w: w,
            h: h,
            bin: rect.bin
        };
        if (w < rect.w)
        {
            this.releaseSpace(rect.bin, rect.x + w, rect.y + rect.h, rect.w - w, h);
        }
        else
        {
            this.releaseSpace(rect.bin, rect.x + rect.w, rect.y, w - rect.w, rect.h);
            rect.w = w;
        }
        rect.h += h;
        return fit;
    }
}


//
// MinHeap
//
// Min binary heap using pairs of key/value and a given comparison function return true if key1 < key2
//
class MinHeap<K,T>
{
    private heap: Array<{ key: K; data: T; }>;
    private compare: (key1: K, key2: K) => boolean;

    private swap(i1, i2)
    {
        var heap = this.heap;
        var tmp = heap[i1];
        heap[i1] = heap[i2];
        heap[i2] = tmp;
    }

    constructor(compare: (key1: K, key2: K) => boolean)
    {
        this.compare = compare;
        this.heap = [];
    }

    clear(): void
    {
        this.heap = [];
    }

    // Remove element from binary heap at some location 'i'
    private removeNode(i: number)
    {
        // Swap element with last in heap.
        //   Filter element either up or down to re-heapify.
        //   This 'removes' the element from the heap
        var heap = this.heap;
        var h2 = heap.length - 1;
        if (i !== h2)
        {
            heap[i] = heap[h2];
            // Check if we must filter up or down.
            var parent = (i - 1) >>> 1;
            if (i === 0 || this.compare(heap[parent].key, heap[i].key))
            {
                // Filter down
                while (true)
                {
                    var left  = (i << 1) + 1;
                    var right = (i << 1) + 2;
                    var small = i;
                    if (left  < h2 && this.compare(heap[left].key, heap[small].key))
                    {
                        small = left;
                    }
                    if (right < h2 && this.compare(heap[right].key, heap[small].key))
                    {
                        small = right;
                    }
                    if (i === small)
                    {
                        break;
                    }
                    this.swap(i, small);
                    i = small;
                }
            }
            else
            {
                // Filter up
                while (parent !== i && this.compare(heap[i].key, heap[parent].key))
                {
                    this.swap(i, parent);
                    i = parent;
                    if (parent === 0)
                    {
                        break;
                    }
                    parent = (parent - 1) >>> 1;
                }
            }
        }
        heap.pop();
    }

    // Find element id based on value
    private findNode(data: T): number
    {
        var i = 0;
        var heap = this.heap;
        var count = heap.length;
        while (i < count)
        {
            if (heap[i].data === data)
            {
                break;
            }
            i += 1;
        }
        return i;
    }

    // remove data from heap, returns true if removed.
    remove(data: T): boolean
    {
        var ind = this.findNode(data);
        if (ind === this.heap.length)
        {
            return false;
        }
        this.removeNode(ind);
        return true;
    }

    insert(data: T, key: K): void
    {
        var heap = this.heap;
        var i = heap.length;
        heap.push({
            data: data,
            key: key
        });
        if (i !== 0)
        {
            var parent = (i - 1) >>> 1;
            while (parent !== i && this.compare(heap[i].key, heap[parent].key))
            {
                this.swap(i, parent);
                i = parent;
                if (parent === 0)
                {
                    break;
                }
                parent = (parent - 1) >>> 1;
            }
        }
    }

    headData(): T
    {
        return (this.heap.length === 0 ? null : this.heap[0].data);
    }
    headKey(): K
    {
        return (this.heap.length === 0 ? null : this.heap[0].key);
    }

    pop(): T
    {
        if (this.heap.length === 0)
        {
            return null;
        }
        var ret = this.heap[0].data;
        this.removeNode(0);
        return ret;
    }
}

//
// TimeoutQueue
//
// Interface ontop of MinHeap to implement a 'TimeoutQueue'
// a type allowing an efficient way of implementing a large number
// of setTimeout behaviours.
//
class TimeoutQueue<T>
{
    private heap: MinHeap<number, T>;
    // Time since queue was created
    private time: number;

    constructor()
    {
        this.heap = new MinHeap(function (x, y) { return x < y; });
        this.time = 0.0;
    }

    clear(): void
    {
        this.heap.clear();
        this.time = 0.0;
    }

    remove(data: T): boolean
    {
        return this.heap.remove(data);
    }

    insert(data: T, timeout: number): void
    {
        this.heap.insert(data, this.time + timeout);
    }

    update(deltaTime: number): void
    {
        this.time += deltaTime;
    }

    hasNext(): boolean
    {
        var key = this.heap.headKey();
        return (key !== null) && key <= this.time;
    }

    next(): T
    {
        return this.heap.pop();
    }

    iter(lambda: (data: T) => void): void
    {
        while (this.hasNext())
        {
            lambda(this.next());
        }
    }
}

//
// ParticleQueue (private type)
//
// Represents the available particles in a system efficiently using a min-binary heap
// whose key is the absolute time at which a particle will die.
//
// Uses a specialised version of TimeoutQueue/Minheap with compressed storage for better performance
// in this specific use case.
//
class ParticleQueue
{
    // (time, index) pair list
    private heap: Float32Array;
    private heapSize: number;

    // Time since queue was created
    private time: number;
    // Current time of last particle death in system.
    private lastDeath: number;

    // Whether the last creation was forced.
    wasForced: boolean;

    private swap(i1, i2)
    {
        var heap = this.heap;
        var tmp = heap[i1];
        heap[i1] = heap[i2];
        heap[i2] = tmp;

        tmp = heap[i1 + 1];
        heap[i1 + 1] = heap[i2 + 1];
        heap[i2 + 1] = tmp;
    }

    // pre: maxParticles >= 0
    constructor(maxParticles: number)
    {
        this.heapSize = maxParticles << 1;
        this.heap = new Float32Array(this.heapSize);
        this.time = 0.0;
        this.wasForced = false;
        this.lastDeath = 0.0;

        // Set up indices
        var i;
        for (i = 0; i < maxParticles; i += 1)
        {
            this.heap[(i << 1) + 1] = i;
        }
    }

    clear(): void
    {
        var i;
        var count = (this.heapSize >>> 1);
        // reset times.
        for (i = 0; i < count; i += 1)
        {
            this.heap[i << 1] = 0.0;
        }
        this.time = 0.0;
        this.wasForced = false;
        this.lastDeath = 0.0;
    }

    // Remove element from binary heap at some location 'i'
    //   and re-insert it again with new time value.
    replace(i: number, time: number)
    {
        // Swap element with last in heap.
        //   Filter element either up or down to re-heapify.
        //   This 'removes' the element from the heap
        var heap = this.heap;
        var h2 = this.heapSize - 2;
        if (i !== h2)
        {
            this.swap(i, h2);
            // Check if we must filter up or down.
            var parent = ((i - 2) >>> 2) << 1;
            if (i === 0 || heap[i] >= heap[parent])
            {
                // Filter down
                while (true)
                {
                    var left  = (i << 1) + 2;
                    var right = (i << 1) + 4;
                    var small = i;
                    if (left  < h2 && heap[left]  < heap[small])
                    {
                        small = left;
                    }
                    if (right < h2 && heap[right] < heap[small])
                    {
                        small = right;
                    }
                    if (i === small)
                    {
                        break;
                    }
                    this.swap(i, small);
                    i = small;
                }
            }
            else
            {
                // Filter up
                while (parent !== i && heap[i] < heap[parent])
                {
                    this.swap(i, parent);
                    i = parent;
                    if (parent === 0)
                    {
                        break;
                    }
                    parent = ((parent - 2) >>> 2) << 1;
                }
            }
        }

        // set new time for last element in heap.
        // and filter up to correct position.
        i = h2;
        heap[i] = time;
        if (i !== 0)
        {
            var parent = ((i - 2) >>> 2) << 1;
            while (parent !== i && heap[i] < heap[parent])
            {
                this.swap(i, parent);
                i = parent;
                if (parent === 0)
                {
                    break;
                }
                parent = ((parent - 2) >>> 2) << 1;
            }
        }

        return heap[i + 1];
    }

    private find(particleID: number): number
    {
        var i = 0;
        var heap = this.heap;
        var count = this.heapSize;
        while (i < count)
        {
            if (heap[i + 1] === particleID)
            {
                break;
            }
            i += 2;
        }
        return i;
    }

    removeParticle(particleID: number): void
    {
        // insert with time = 0 so that particle is moved to
        // root of heap (most efficent removal method).
        this.replace(this.find(particleID), 0);
    }

    updateParticle(particleID: number, lifeDelta: number): void
    {
        var i = this.find(particleID);
        var deathTime = this.heap[i] + lifeDelta;
        // Prevent updates on dead particles making them
        // even more dead (violates heap property in general).
        if (deathTime < this.time)
        {
            deathTime = this.time;
        }
        if (deathTime > this.lastDeath)
        {
            this.lastDeath = deathTime;
        }
        this.replace(i, deathTime);
    }

    create(timeTillDeath: number, forceCreation:boolean = false): number
    {
        if (forceCreation || (this.heap[0] <= this.time))
        {
            this.wasForced = (this.heap[0] > this.time);
            var id = this.heap[1];
            var deathTime = timeTillDeath + this.time;
            if (deathTime > this.lastDeath)
            {
                this.lastDeath = deathTime;
            }
            this.replace(0, deathTime);
            return id;
        }
        else
        {
            return null;
        }
    }

    // Returns if - after system updater - there will be any potentially live particles remaining.
    update(timeUpdate: number): boolean
    {
        this.time += timeUpdate;
        return (this.time < this.lastDeath);
    }
}

//
// ParticleBuilder and helpers
// ---------------------------
//
// Used to transform animation descriptions into texture data for particle system.
// Also performs texture packing on gpu for particle textures.
//

//
// Interface for result of build step encoding system and particle animation information.
// These interfaces are returned to the user.
//
interface ParticleSystemAnimation
{
    maxLifeTime: number;
    animation  : Texture;
    particle   : { [name: string]: ParticleDefn };
    attribute  : { [name: string]: AttributeRange };
}
interface AttributeRange
{
    min  : Array<number>;
    delta: Array<number>;
}
interface ParticleDefn
{
    lifeTime      : number;
    animationRange: Array<number>;
}

//
// Interface for intermediate parse result of a system defined attribute.
// (Internal to ParticleBuilder)
//
enum AttributeCompress
{
    cNone,
    cHalf,
    cFull
}
enum AttributeStorage
{
    sDirect,
    sNormalized
}
interface Attribute
{
    name               : string;
    // tFloat, tFloat2, tFloat4 or tTexture(n) as number
    // TypeScript has no algebraic data types to represent this 'nicely'.
    type               : any;
    defaultValue       : Array<number>;
    defaultInterpolator: Interpolator;
    minValue           : Array<number>;
    maxValue           : Array<number>;
    compress           : AttributeCompress;
    storage            : AttributeStorage;
}

//
// Interface for intermediate parse result of a particle defined animation.
// (Internal to ParticleBuilder)
//
interface Particle
{
    name        : string;
    fps         : number;
    animation   : Array<Snapshot>;
    textureUVs  : { [name: string]: Array<Array<number>> };
    textureSizes: { [name: string]: Array<number> };
}
interface Snapshot
{
    time         : number;
    attributes   : { [name: string]: Array<number> };
    interpolators: { [name: string]: Interpolator };
}

//
// Interface for defined interpolators supported by build step.
// (Internal to ParticleBuilder)
//
interface InterpolatorFun
{
    (vs: Array<Array<number>>, ts: Array<number>, t: number): Array<number>;
}
interface Interpolator
{
    fun    : InterpolatorFun;
    offsets: Array<number>;
    type   : string;
}

//
// Collects errors accumulated during parse/analysis of the input objects.
// (private helper of ParticleBuilder)
//
// TODO, make private to this module somehow?
class BuildError
{
    // print strings surrounded by "" to avoid confusing "10" with 10
    static wrap(x: any): string
    {
        if (Types.isString(x))
        {
            return '"' + x + '"';
        }
        else
        {
            return "" + x;
        }
    }

    private uncheckedErrorCount: number;
    private uncheckedWarningCount: number;
    private log: Array<{ error: boolean; log: string; }>;

    empty(includeWarnings: boolean): boolean
    {
        if (includeWarnings)
        {
            return this.log.length === 0;
        }
        else
        {
            var log = this.log;
            var count = log.length;
            var i;
            for (i = 0; i < count; i += 1)
            {
                if (log[i].error)
                {
                    return false;
                }
            }
            return true;
        }
    }

    error(x: string): void
    {
        this.uncheckedErrorCount += 1;
        this.log.push({ error: true, log: BuildError.ERROR + "::" + x });
    }
    warning(x: string): void
    {
        this.uncheckedWarningCount += 1;
        this.log.push({ error: false, log: BuildError.WARNING + "::" + x });
    }

    private static ERROR = "ERROR";
    private static WARNING = "WARNING";

    checkErrorState(msg?: string): boolean
    {
        if (this.uncheckedWarningCount !== 0)
        {
            this.log.push({ error: false, log: "Warnings (" + this.uncheckedWarningCount + ")" });
            this.uncheckedWarningCount = 0;
        }
        if (this.uncheckedErrorCount !== 0)
        {
            this.log.push({ error: true, log: "Errors (" + this.uncheckedErrorCount + ")" });
            if (msg)
            {
                this.log.push({ error: true, log: msg });
            }
            this.uncheckedErrorCount = 0;
            return true;
        }
        else
        {
            return false;
        }
    }

    fail(msg: string): string
    {
        var log = this.log;
        if (!this.checkErrorState(msg))
        {
            log.push({ error: true, log: msg });
        }

        var count = log.length;
        var i;

        // compile log
        var ret = "";
        for (i = 0; i < count; i += 1)
        {
            if (i !== 0)
            {
                ret += "\n";
            }
            ret += log[i].log;
        }

        this.log = [];
        return ret;
    }

    constructor()
    {
        this.log = [];
        this.uncheckedErrorCount = 0;
        this.uncheckedWarningCount = 0;
    }
}

//
// Type checking (private helper of ParticleBuilder)
//
// TODO, make private to this moduole somewhoe?
class Types {
    static isArray(x: any): boolean
    {
        return Object.prototype.toString.call(x) === "[object Array]";
    }
    static isNumber(x: any): boolean
    {
        return Object.prototype.toString.call(x) === "[object Number]";
    }
    static isString(x: any): boolean
    {
        return Object.prototype.toString.call(x) === "[object String]";
    }
    static isBoolean(x: any): boolean
    {
        return Object.prototype.toString.call(x) === "[object Boolean]";
    }
    static isObject(x: any): boolean
    {
        return Object.prototype.toString.call(x) === "[object Object]";
    }
    static isNullUndefined(x: any): boolean
    {
        // x == null also works.
        return x === null || x === undefined;
    }

    static checkAssignment(error: BuildError, objx: string, objt: string, value: Array<number>, type: any): void
    {
        if (type === null)
        {
            return;
        }
        switch (type)
        {
            case "tFloat":
                if (value.length !== 1)
                {
                    error.error("Cannot type " + BuildError.wrap(value) + " with type float for " +
                                objt + " in " + objx);
                }
                break;
            case "tFloat2":
                if (value.length !== 2)
                {
                    error.error("Cannot type " + BuildError.wrap(value) + " with type float2 for " +
                                objt + " in " + objx);
                }
                break;
            case "tFloat4":
                if (value.length !== 4)
                {
                    error.error("Cannot type " + BuildError.wrap(value) + " with type float4 for " +
                                objt + " in " + objx);
                }
                break;
            default: // tTexture(n)
                if (value.length !== 1)
                {
                    error.error("Cannot type " + BuildError.wrap(value) + " with type texture" + <number>type +
                                " for " + objt + " in " + objx);
                }
        }
    }
}

//
// Parser (private helper of ParticleBuilder)
//
// TODO, make private to this module somehow?
class Parser {
    private static interpolators: { [name: string]: (params: any) => Interpolator } = {
        "none": function (_): Interpolator
        {
            return {
                type: "none",
                offsets: [-1],
                fun: function (vs, _1, _2)
                {
                    return vs[0];
                }
            };
        },
        "linear": function (_): Interpolator
        {
            return {
                type: "linear",
                offsets: [-1, 1],
                fun: function (vs, _, t)
                {
                    if (!vs[1])
                    {
                        return vs[0];
                    }
                    else
                    {
                        var ret = [];
                        var count = vs[0].length;
                        var i;
                        for (i = 0; i < count; i += 1)
                        {
                            ret[i] = (vs[0][i] * (1 - t)) + (vs[1][i] * t);
                        }
                        return ret;
                    }
                }
            };
        },
        "cardinal": function (def: { tension: number; }): Interpolator
        {
            return {
                type: "cardinal",
                offsets: [-2, -1, 1, 2],
                fun: function (vs, ts, t)
                {
                    var n = vs[1].length;
                    // Zero gradients at start/end points of animation
                    // only offset -1 is guaranteed.
                    // we want to gracefully degenerate in even worse situations.
                    var v1 = vs[1];
                    var t1 = ts[1];
                    var v0 = vs[0] || v1;
                    var t0 = ts[0] || t1;
                    var v2 = vs[2] || v1;
                    var t2 = ts[2] || t1;
                    var v3 = vs[3] || v2;
                    var t3 = ts[3] || t2;

                    // Hermite weights
                    var tsqrd = t * t;
                    var tcube = tsqrd * t;
                    var wv1 = 2 * tcube - 3 * tsqrd + 1;
                    var wv2 = - 2 * tcube + 3 * tsqrd;
                    var wm1 = tcube - 2 * tsqrd + t;
                    var wm2 = tcube - tsqrd;

                    var ret = [];
                    var i;
                    for (i = 0; i < n; i += 1)
                    {
                        var m1 = (1 - def.tension) * (v2[i] - v0[i]) / (t2 - t0);
                        var m2 = (1 - def.tension) * (v3[i] - v1[i]) / (t3 - t1);
                        if (isNaN(m1))
                        {
                            // occurs when (after degeneralisation), v2=v0 & t2=t0
                            m1 = 0;
                        }
                        if (isNaN(m2))
                        {
                            // occurs when (after degeneralisation), v3=v1 & t3=t1
                            m2 = 0;
                        }
                        ret[i] = (v1[i] * wv1) + (m1 * wm1) + (m2 * wm2) + (v2[i] * wv2);
                    }
                    return ret;
                }
            };
        },
        "catmull": function (_): Interpolator
        {
            var ret = Parser.interpolators["cardinal"]({ tension: 0.0 });
            ret.type = "catmull";
            return ret;
        }
    };

    // Check for any extra fields that should not be present
    static extraFields(error: BuildError, obj: string, x: Object, excludes: Array<string>): void
    {
        for (var f in x)
        {
            if (x.hasOwnProperty(f) && excludes.indexOf(f) === -1)
            {
                error.warning(obj + " has extra field '" + f + "'");
            }
        }
    }

    // Return object field if it exists, otherwise error and return null
    static field(error: BuildError, obj: string, x: Object, n: string): any
    {
        if (!x.hasOwnProperty(n))
        {
            error.error("No field '" + n + "' found on " + obj);
            return null;
        }
        else
        {
            return x[n];
        }
    }

    // Return object field as a string, if it does not exist (or not a string), error.
    static stringField(error: BuildError, obj: string, x: Object, n: string): string
    {
        var ret: any = Parser.field(error, obj, x, n);
        if (x.hasOwnProperty(n) && !Types.isString(ret))
        {
            error.error("Field '" + n + "' of " + obj + " is not a string (" + BuildError.wrap(ret) + ")");
            return null;
        }
        else
        {
            return (<string>ret);
        }
    }

    // Return object field as a number, if it does not exist (or not a number), error.
    static numberField(error: BuildError, obj: string, x: Object, n: string): number
    {
        var ret: any = Parser.field(error, obj, x, n);
        if (x.hasOwnProperty(n) && !Types.isNumber(ret))
        {
            error.error("Field '" + n + "' of " + obj + " is not a number (" + BuildError.wrap(ret) + ")");
            return null;
        }
        else if (!isFinite(ret))
        {
            error.error("Field '" + n + "' of " + obj + " is nan or infinite (" + BuildError.wrap(ret) + ")");
            return null;
        }
        else
        {
            return (<number>ret);
        }
    }

    // Check value is a number, and error otherwise.
    static checkNumber(error: BuildError, obj: string, n: string, ret: any): number
    {
        if (!Types.isNumber(ret))
        {
            error.error("Field '" + n + "' of " + obj + " is not a number (" + BuildError.wrap(ret) + ")");
            return null;
        }
        else if (!isFinite(ret))
        {
            error.error("Field '" + n + "' of " + obj + " is nan or infinite (" + BuildError.wrap(ret) + ")");
            return null;
        }
        else
        {
            return (<number>ret);
        }
    }

    // Map object field via run function if it exists, otherwise return default result.
    static maybeField<R>(x: Object, n: string, run: (field: any) => R, def: () => R): R
    {
        return (x.hasOwnProperty(n)) ? run(x[n]) : def();
    }

    // Check attribute value agaisnt type, and error if not compatible.
    // If acceptNull is true, then attribute (sub) values are permitted to be null.
    static typeAttr(error: BuildError, obj: string, type: any, acceptNull: boolean, val: any): Array<number>
    {
        if (type === null)
        {
            // Cannot perform type check.
            return <Array<number>>null;
        }

        var isNumber = function(val: any): boolean
        {
            return (val === null && acceptNull) || Types.isNumber(val);
        };
        var checkArray = function (val: any, n: number): Array<number>
        {
            if (!Types.isArray(val))
            {
                error.error("Value '" + BuildError.wrap(val) + "' should be a float" + n + " for " + obj);
                return null;
            }

            var arr = <Array<number>>val;
            var count = arr.length;
            if (count !== n)
            {
                error.error("Value '" + BuildError.wrap(val) + "' should have " + n + " elements for float " + n + obj);
                val = null;
            }

            var i;
            for (i = 0; i < count; i += 1)
            {
                if (!isNumber(arr[i]))
                {
                    error.error("Element " + i + " of value '" + BuildError.wrap(val) +
                        "' should be a number (" + BuildError.wrap(arr[i]) + ") for " + obj);
                    val = null;
                }
            }
            return <Array<number>>val;
        };
        switch (type)
        {
            case "tFloat2":
                return checkArray(val, 2);
            case "tFloat4":
                return checkArray(val, 4);
            case "tFloat":
            default: // tTexture(n)
                if (!isNumber(val))
                {
                    error.error("Value '" + BuildError.wrap(val) + "' should be a number for " + obj);
                    return null;
                }
                return [<number>val];
        }
    }

    // return default attribute value for a type.
    static defaultAttr(type: any, val: number = null): Array<number>
    {
        if (type === null)
        {
            // Can't type check.
            return null;
        }

        switch (type)
        {
            case "tFloat2":
                return [val, val];
            case "tFloat4":
                return [val, val, val, val];
            case "tFloat":
            default: // tTexture(n)
                return [val];
        }
    }

    // Parse a system definition object.
    static parseSystem(error: BuildError, defn: any): Array<Attribute>
    {
        var attrs:Array<Attribute>;
        if (!Types.isArray(defn))
        {
            error.error("System definition must be an array of attribute defintions");
            attrs = null;
        }
        else
        {
            attrs = [];
            var defnArray = <Array<any>>(defn);
            var count = defnArray.length;
            var i;
            for (i = 0; i < count; i += 1)
            {
                attrs[i] = Parser.parseSystemAttribute(error, defnArray[i]);
            }

            // Check for duplicates
            for (i = 0; i < count; i += 1)
            {
                var j;
                for (j = (i + 1); j < count; j += 1)
                {
                    if (attrs[i].name === attrs[j].name)
                    {
                        error.error("System definition has conflicting attribute declarations for '" +
                            attrs[i].name + "'");
                    }
                }
            }
        }

        if (error.checkErrorState("System parse failed!"))
        {
            return null;
        }
        else
        {
            return attrs;
        }
    }

    // Parse a system attribute definition.
    static parseSystemAttribute(error: BuildError, defn: any): Attribute
    {
        var name = Parser.stringField(error, "system attribute", defn, "name");
        if (name !== null && name.length > 14 && name.substr(name.length - 14) === "-interpolation")
        {
            error.error("System attribute cannot have '-interpolation' as a suffix (" + name + ")");
            name = null;
        }
        var printName  = (name === null) ? "" : " '"+name+"'";
        var printNames = (name === null) ? "'s" : " '"+name+"'s";

        var stringField = Parser.stringField.bind(null, error, "system attribute" + printName);
        var parseInterpolator =
            Parser.parseInterpolator.bind(null, error, "system attribute" + printNames +
                                                       " default-interpolation field");

        var typeName = stringField(defn, "type");
        var type = null;
        if (typeName !== null)
        {
            switch (typeName) {
                case "float":
                    type = "tFloat";
                    break;
                case "float2":
                    type = "tFloat2";
                    break;
                case "float4":
                    type = "tFloat4";
                    break;
                default:
                    if (typeName.substr(0, 7) === "texture")
                    {
                        type = parseFloat(typeName.substr(7));
                    }
                    else
                    {
                        error.error("Unknown attribute type '" + typeName + "' for system attribute" + printName);
                    }
            }
        }
        var typeAttr = function (n)
            {
                return Parser.typeAttr.bind(null, error, "system attribute" + printNames + " " + n + " field", type);
            };

        var defaultValue = Parser.maybeField(defn, "default", typeAttr("default").bind(null, false),
                                     Parser.defaultAttr.bind(null, type, 0));
        var defaultInterpolator = Parser.maybeField(defn, "default-interpolation", parseInterpolator,
                                     Parser.interpolators["linear"].bind(null));

        var parseMinMax = function (n)
            {
                // Can't type check for null type.
                if (type === null)
                {
                    return null;
                }

                switch (type)
                {
                    case "tFloat":
                    case "tFloat2":
                    case "tFloat4":
                        return Parser.maybeField(defn, n, typeAttr(n).bind(null, true),
                                                 Parser.defaultAttr.bind(null, type, null));
                    default:
                        if (defn.hasOwnProperty(n))
                        {
                            error.error(n + " is not accepted for system texture attribute" + printName);
                            return null;
                        }
                }
            };
        var minValue = parseMinMax("min");
        var maxValue = parseMinMax("max");

        var compress = Parser.maybeField(defn, "compress",
            function (val)
            {
                switch (val)
                {
                    case "none":
                        return AttributeCompress.cNone;
                    case "half":
                        return AttributeCompress.cHalf;
                    case "full":
                        return AttributeCompress.cFull;
                    default:
                        error.error("Unknown compression type '" + val + "' for system attribute " + printName);
                        return null;
                }
            },
            function ()
            {
                return AttributeCompress.cFull;
            });

        // can't check for null type
        var storage = null;
        if (type !== null)
        {
            switch (type)
            {
                case "tFloat":
                case "tFloat2":
                case "tFloat4":
                    storage = Parser.maybeField(defn, "storage",
                        function (val)
                        {
                            switch (val)
                            {
                                case "direct":
                                    return AttributeStorage.sDirect;
                                case "normalized":
                                    return AttributeStorage.sNormalized;
                                default:
                                    error.error("Unknown storage type '" + val + "' for system attribute " + printName);
                                    return null;
                            }
                        },
                        function ()
                        {
                            return AttributeStorage.sNormalized;
                        });
                    break;
                default: // tTexture(n)
                    if (defn.hasOwnProperty("storage"))
                    {
                        error.error("Storage type is not accepted for system texture attribute" + printName);
                    }
            }
        }

        Parser.extraFields(error, "system attribute" + printName, defn,
            ["name", "type", "default", "default-interpolation", "min", "max", "storage", "compress"]);

        return {
            name               : name,
            type               : type,
            defaultValue       : defaultValue,
            defaultInterpolator: defaultInterpolator,
            minValue           : minValue,
            maxValue           : maxValue,
            compress           : compress,
            storage            : storage
        };
    }

    // Parse attribute interpolator definition
    static parseInterpolator(error: BuildError, obj: string, defn: any): Interpolator
    {
        if (Types.isString(defn))
        {
            var defnString = <string>defn;
            switch (defnString)
            {
                case "none":
                    return Parser.interpolators["none"](null);
                case "linear":
                    return Parser.interpolators["linear"](null);
                case "catmull":
                    return Parser.interpolators["catmull"](null);
                default:
                    error.error("Unknown interpolator type '" + defnString + "' for " + obj);
                    return null;
            }
        }
        else if (defn === null)
        {
            error.error("Interpolator cannot be null for " + obj);
            return null;
        }
        else if (Types.isObject(defn))
        {
            var defnObj = <Object>(defn);
            var type = Parser.stringField(error, obj, defnObj, "type");
            if (type === null)
            {
                error.error("complex interpolator type cannot be null for " + obj);
                return null;
            }
            switch (type)
            {
                case "none":
                    Parser.extraFields(error, obj, defnObj, ["type"]);
                    return Parser.interpolators["none"](null);
                case "linear":
                    Parser.extraFields(error, obj, defnObj, ["type"]);
                    return Parser.interpolators["linear"](null);
                case "catmull":
                    Parser.extraFields(error, obj, defnObj, ["type"]);
                    return Parser.interpolators["catmull"](null);
                case "cardinal":
                    Parser.extraFields(error, obj, defnObj, ["type", "tension"]);
                    var tension = Parser.numberField(error, obj, defnObj, "tension");
                    return Parser.interpolators["cardinal"]({ tension: tension });
                default:
                    error.error("Unknown complex interpolator type '" + type + "' for " + obj);
                    return null;
            }
        }
        else
        {
            error.error("Invalid interpolator for " + obj +
                        ". Should be an interpolator name, or complex interpolator definition, not " +
                        BuildError.wrap(defn));
            return null;
        }
    }

    // avoid creating in loops.
    private static zero(): number
    {
        return 0;
    }
    static parseParticle(error: BuildError, defn: any): Particle
    {
        if (defn === null)
        {
            error.error("particle definition cannot be null");
            error.checkErrorState("Particle parse failed!");
            return null;
        }

        var name = Parser.stringField(error, "particle", defn, "name");
        var printName  = (name === null) ? "" : " '"+name+"'";
        var printNames = (name === null) ? "'s" : " '"+name+"'s";

        var stringField = Parser.stringField.bind(null, error, "particle" + printName);
        var numberField = Parser.numberField.bind(null, error, "particle" + printName);

        var fps =
            Parser.maybeField(defn, "fps",
                              Parser.checkNumber.bind(null, error, "particle" + printName, "fps"),
                              function () { return 30; });
        if (fps !== null && fps <= 0.0)
        {
            error.error("particle" + printNames + " fps (" + fps + ") must be > 0");
            fps = null;
        }

        var textures = [];
        for (var f in defn)
        {
            if (!defn.hasOwnProperty(f))
            {
                continue;
            }

            if (f.substr(0, 7) === "texture")
            {
                if (f.substr(f.length - 5) === "-size")
                {
                    textures.push(f.substr(0, f.length - 5));
                }
                else
                {
                    textures.push(f);
                }
            }
        }
        var textureUVs = {};
        var textureSizes = {};
        var count = textures.length;
        var i, j;
        for (i = 0; i < count; i += 1)
        {
            var tex = textures[i];
            if (defn.hasOwnProperty(tex) && !Types.isArray(defn[tex]))
            {
                error.error("particle" + printNames + " " + f + " should be an Array");
            }
            else if (defn.hasOwnProperty(tex))
            {
                var uvs = <Array<any>>defn[tex];
                var fcount = uvs.length;
                var outUVs = [];
                for (j = 0; j < fcount; j += 1)
                {
                    outUVs.push(Parser.typeAttr(error, "element of particle" + printNames + " " + f,
                                                "tFloat4", false, uvs[j]));
                }
                textureUVs[tex] = outUVs.concat();
            }
            if (defn.hasOwnProperty(tex + "-size"))
            {
                textureSizes[tex] = Parser.typeAttr(error, "particle" + printNames + " " + f + "-size",
                                                "tFloat2", false, defn[tex + "-size"]);
            }
        }

        var animation = Parser.field(error, "particle" + printName, defn, "animation");
        if (defn.hasOwnProperty("animation") && !Types.isArray(animation))
        {
            error.error("particle" + printNames + " animation must be an array");
            animation = null;
        }
        var animationOut = null;
        if (animation !== null)
        {
            var animationArr = <Array<any>>animation;
            if (animationArr.length === 0)
            {
                error.error("particle" + printNames + " animation is empty");
                animationOut = null;
            }
            else
            {
                animationOut = [];
                count = animationArr.length;
                for (i = 0; i < count; i += 1)
                {
                    var snap = animationArr[i];
                    var obj = "particle" + printNames + " animation snapshot";
                    if (!Types.isObject(snap))
                    {
                        error.error(obj + " should be an object");
                        animationOut[i] = null;
                        continue;
                    }

                    var snapObj = <Object>snap;
                    var time;
                    if (i === 0)
                    {
                        time = Parser.maybeField(snapObj, "time",
                                                 Parser.checkNumber.bind(null, error, obj, "time"),
                                                 Parser.zero);
                        if (time !== 0)
                        {
                            error.error("first " + obj + " time must be 0");
                            time = null;
                        }
                    }
                    else
                    {
                        time = Parser.numberField(error, obj, snapObj, "time");
                        if (time !== null && time <= 0)
                        {
                            error.error(obj + " time must be positive");
                            time = null;
                        }
                    }

                    var attributes = {};
                    var interpolators = {};
                    for (var f in snapObj)
                    {
                        if (!snapObj.hasOwnProperty(f) || f === "time")
                        {
                            continue;
                        }
                        if (f.length > 14 && f.substr(f.length - 14) === "-interpolation")
                        {
                            var attr = f.substr(0, f.length - 14);
                            interpolators[attr] =
                                Parser.parseInterpolator(error, obj + " attribute '" + attr + "'", snapObj[f]);
                        }
                        else
                        {
                            attributes[f] =
                                Parser.parseAttributeValue(error, obj + " attribute '" + f + "'", snapObj[f]);
                        }
                    }

                    animationOut[i] = {
                        time         : time,
                        attributes   : attributes,
                        interpolators: interpolators
                    };
                }
            }
        }

        var sizes = [];
        count = textures.length;
        for (i = 0; i < count; i += 1)
        {
            sizes.push(textures[i] + "-size");
        }
        Parser.extraFields(error, "particle" + printName, defn,
                           textures.concat(sizes).concat(["name", "fps", "animation"]));

        if (error.checkErrorState("Particle" + printName + " parse failed!"))
        {
            return null;
        }
        else
        {
            return {
                name        : name,
                fps         : fps,
                animation   : animationOut,
                textureUVs  : textureUVs,
                textureSizes: textureSizes
            };
        }
    }

    static parseAttributeValue(error: BuildError, obj: string, def: any): Array<number>
    {
        if (def === null)
        {
            error.error(obj + " cannot be null");
            return null;
        }

        if (Types.isNumber(def))
        {
            return [<number>def];
        }

        if (Types.isArray(def))
        {
            // At this point, can assume we have tFloat2 or tFloat4 only as no
            // interpolator uses an array definition.
            var defArr = <Array<any>>def;
            var count = defArr.length;
            var i;
            for (i = 0; i < count; i += 1)
            {
                var val = defArr[i];
                if (!Types.isNumber(val))
                {
                    error.error("Element of " + obj + " has none number value (" + val + ")");
                    return null;
                }

            }
            if (defArr.length !== 2 && defArr.length !== 4)
            {
                error.error(obj + " should have either 2 or 4 elements for float2/float4 value");
                return null;
            }
            return defArr;
        }

        error.error(obj + " has unrecognised value type");
        return null;
    }
}

//
// ParticleBuilder
//
class ParticleBuilder
{
    private static buildAnimationTexture(
        graphicsDevice: GraphicsDevice,
        width: number,
        height: number,
        data: Uint8Array
    ): Texture
    {
        return graphicsDevice.createTexture({
            name      : "ParticleBuilder AnimationTexture",
            width     : width,
            height    : height,
            depth     : 1,
            format    : graphicsDevice.PIXELFORMAT_R8G8B8A8,
            mipmaps   : false,
            cubemap   : false,
            renderable: false,
            dynamic   : false,
            data      : data
        });
    }

    private static nearPow2Geq(x)
    {
        return (1 << Math.ceil(Math.log(x) / Math.log(2)));
    }

    private static packedTextureVertices : VertexBuffer;
    private static packedTextureSemantics: Semantics;
    private static packedCopyParameters  : TechniqueParameters;
    private static packedCopyTechnique   : Technique;
    static packTextures(params: {
        graphicsDevice: GraphicsDevice;
        textures      : Array<Texture>;
        borderShrink? : number;
    }): { texture: Texture; uvMap : Array<Array<number>> }
    {
        var graphicsDevice = params.graphicsDevice;
        var textures = params.textures;
        var borderShrink = params.borderShrink;
        if (borderShrink === undefined)
        {
            borderShrink = 4;
        }
        // Init vertexBuffer/semantics/shader technique if required.
        var vertices, semantics, parameters, technique;
        if (!ParticleBuilder.packedTextureVertices)
        {
            vertices = ParticleBuilder.packedTextureVertices =
                graphicsDevice.createVertexBuffer({
                    numVertices: 4,
                    attributes : [graphicsDevice.VERTEXFORMAT_FLOAT2],
                    dynamic    : false,
                    data       : [0,0, 1,0, 0,1, 1,1]
                });
            semantics = ParticleBuilder.packedTextureSemantics =
                graphicsDevice.createSemantics([
                    graphicsDevice.SEMANTIC_POSITION
                ]);
            parameters = ParticleBuilder.packedCopyParameters =
                graphicsDevice.createTechniqueParameters({
                    dim: [0, 0],
                    dst: [0, 0, 0, 0]
                });

            // Shader embedded from assets/shaders/particles-packer.cgfx
            var shader = graphicsDevice.createShader({"version":1,"name":"particles-packer.cgfx","samplers":{"src":{"MinFilter":9987,"MagFilter":9729,"WrapS":33071,"WrapT":33071}},"parameters":{"src":{"type":"sampler2D"},"dim":{"type":"float","columns":2},"dst":{"type":"float","columns":4},"border":{"type":"float"}},"techniques":{"pack":[{"parameters":["dim","dst","border","src"],"semantics":["POSITION"],"states":{"DepthTestEnable":false,"DepthMask":false,"CullFaceEnable":false,"BlendEnable":false},"programs":["vp_pack","fp_pack"]}]},"programs":{"fp_pack":{"type":"fragment","code":"#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying vec4 tz_TexCoord[1];\nvec4 _ret_0;uniform sampler2D src;void main()\n{_ret_0=texture2D(src,tz_TexCoord[0].xy);gl_FragColor=_ret_0;}"},"vp_pack":{"type":"vertex","code":"#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying vec4 tz_TexCoord[1];attribute vec4 ATTR0;\nvec4 _outPosition1;vec2 _outUV1;uniform vec2 dim;uniform vec4 dst;uniform float border;void main()\n{vec2 _xy;vec2 _wh;vec2 _TMP4;_xy=dst.xy*2.0-1.0;_wh=(dst.zw*2.0-1.0)-_xy;_TMP4=_xy+_wh*ATTR0.xy;_outPosition1=vec4(_TMP4.x,_TMP4.y,0.0,1.0);_outUV1=ATTR0.xy+((ATTR0.xy*2.0-1.0)*border)/dim;tz_TexCoord[0].xy=_outUV1;gl_Position=_outPosition1;}"}}});
            technique = ParticleBuilder.packedCopyTechnique = shader.getTechnique("pack");
        }
        else
        {
            vertices   = ParticleBuilder.packedTextureVertices;
            semantics  = ParticleBuilder.packedTextureSemantics;
            parameters = ParticleBuilder.packedCopyParameters;
            technique  = ParticleBuilder.packedCopyTechnique;
        }

        // Determine the unique textures in those supplied
        // keeping track of input indices from unique index.
        var unique  = [];
        var count = textures.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var tex = textures[i];
            var index = unique.indexOf(tex);
            if (index !== -1)
            {
                unique[index].mapping.push(i);
            }
            else
            {
                unique.push({
                    texture: tex,
                    mapping: [i],
                    store: null
                });
            }
        }

        // Sort textures decreasing to improve packing quality.
        unique.sort(function (x, y)
            {
                return (y.texture.width + y.texture.height) - (x.texture.width + x.texture.height);
            });

        // Pack textures.
        var max = graphicsDevice.maxSupported("TEXTURE_SIZE");
        var packer = new OnlineTexturePacker(max, max);
        var ref;
        var refCount = unique.length;
        for (i = 0; i < refCount; i += 1)
        {
            ref = unique[i];
            ref.store = packer.pack(ref.texture.width, ref.texture.height);
            if (ref.store.bin !== 0)
            {
                throw "Packing textures would require more than the maximum size possible";
            }
        }

        graphicsDevice.setStream(vertices, semantics);
        graphicsDevice.setTechnique(technique);
        parameters["border"] = borderShrink;

        // Create texture required with size as the next >= powers of 2 for mip-mapping.
        var bin = packer.bins[0];
        var w = ParticleBuilder.nearPow2Geq(bin.w);
        var h = ParticleBuilder.nearPow2Geq(bin.h);

        var tex = graphicsDevice.createTexture({
            name      : "ParticleBuilder Packed-Texture",
            width     : bin.w,
            height    : bin.h,
            depth     : 1,
            format    : graphicsDevice.PIXELFORMAT_R8G8B8A8,
            mipmaps   : true,
            cubemap   : false,
            renderable: true,
            dynamic   : false
        });
        var target = graphicsDevice.createRenderTarget({
            colorTexture0: tex
        });
        graphicsDevice.beginRenderTarget(target);

        var j;
        var maps = [];
        for (j = 0; j < refCount; j += 1)
        {
            ref = unique[j];

            var mx = (ref.store.x / bin.w);
            var my = (ref.store.y / bin.h);
            var mw = (ref.store.w / bin.w);
            var mh = (ref.store.h / bin.h);
            var map = [
                mx + (borderShrink / w),
                my + (borderShrink / h),
                mx + mw - (borderShrink / w),
                my + mh - (borderShrink / h)
            ];
            var mapCount = ref.mapping.length;
            var k;
            for (k = 0; k < mapCount; k += 1)
            {
                maps[ref.mapping[k]] = map;
            }

            parameters["src"]    = ref.texture;
            parameters["dim"][0] = ref.texture.width;
            parameters["dim"][1] = ref.texture.height;
            parameters["dst"][0] = mx;
            parameters["dst"][1] = my;
            parameters["dst"][2] = mx + mw;
            parameters["dst"][3] = my + mh;
            graphicsDevice.setTechniqueParameters(parameters);
            graphicsDevice.draw(graphicsDevice.PRIMITIVE_TRIANGLE_STRIP, 4, 0);
        }

        graphicsDevice.endRenderTarget();
        target.destroy();

        return {
            texture: tex,
            uvMap  : maps
        };
    }

    static compile(params: {
        graphicsDevice: GraphicsDevice;
        particles: Array<any>;
        system?: any;
        uvMap?: { [name: string]: Array<Array<number>> };
        tweaks?: Array<{ [name: string]: any }>; // any = number | Array<number>
        failOnWarnings: boolean;
    }): ParticleSystemAnimation
    {
        var graphicsDevice = params.graphicsDevice;
        var particles = params.particles;
        var system = params.system;
        var uvMap = params.uvMap;
        var tweaks = params.tweaks;
        var failOnWarnings = params.failOnWarnings;
        if (failOnWarnings === undefined)
        {
            failOnWarnings = true;
        }

        if (!system)
        {
            system = [
                {
                    name: "color",
                    type: "float4",
                    "default": [1.0, 1.0, 1.0, 1.0],
                    min: [0.0, 0.0, 0.0, 0.0],
                    max: [1.0, 1.0, 1.0, 1.0],
                    storage: "direct"
                },
                {
                    name: "scale",
                    type: "float2",
                    "default": [1.0, 1.0]
                },
                {
                    name: "rotation",
                    type: "float",
                    "default": 0.0
                },
                {
                    name: "frame",
                    type: "texture0",
                    "default": 0
                }
            ];
        }

        var error = new BuildError();
        var sys = Parser.parseSystem(error, system);
        var parts = [];
        var count = particles.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            parts[i] = Parser.parseParticle(error, particles[i]);
        }

        // Can't go any further in the compile to gather more errors.
        if (sys === null)
        {
            throw error.fail("Build failed!");
        }

        // Normalise particle UV's based on texture sizes in particle.
        for (i = 0; i < count; i += 1)
        {
            if (parts[i])
            {
                ParticleBuilder.normalizeParticleUVs(parts[i]);
            }
        }

        // Perform UV-remapping of particles
        var sysCount = sys.length;
        var attr;
        if (uvMap)
        {
            // Sanity check the maps
            for (var f in uvMap)
            {
                if (uvMap.hasOwnProperty(f))
                {
                    var map = uvMap[f];
                    if (map.length !== parts.length)
                    {
                        error.error("UV-remapping of " + f + " does not specify the correct number of maps");
                    }
                    var found = false;
                    for (i = 0; i < sysCount; i += 1)
                    {
                        attr = sys[i];
                        if (Types.isNumber(attr.type) && f.substr(8) === ""+attr.type)
                        {
                            found = true;
                            break;
                        }
                    }
                    if (!found)
                    {
                        error.warning("UV-mapping is defined for " + f + " which is not used by system");
                    }
                }
            }
            for (i = 0; i < count; i += 1)
            {
                ParticleBuilder.remapUVs(parts[i], uvMap, i);
            }
        }

        // Check attribute of particles against system attributes
        for (i = 0; i < count; i += 1)
        {
            if (parts[i])
            {
                ParticleBuilder.checkAttributes(error, parts[i], sys);
            }
        }

        // Can't reasonably go further in the compile if any errors have occured.
        if (error.checkErrorState())
        {
            throw error.fail("Build failed!");
        }

        // Set default attributes and interpolators for first snapshot when not defined.
        for (i = 0; i < count; i += 1)
        {
            ParticleBuilder.setDefaults(parts[i], sys);
        }

        // Perform linear remaps of attributes.
        if (tweaks)
        {
            var exclude = [];
            var excludeTypes = [];
            for (i = 0; i < sysCount; i += 1)
            {
                attr = sys[i];
                exclude.push(attr.name + "-scale");
                exclude.push(attr.name + "-offset");
                excludeTypes.push(attr.type);
            }
            var tweakCount = tweaks.length;
            if (tweakCount !== parts.length)
            {
                error.error("Not enough tweaks specified to match particle count");
            }
            for (i = 0; i < tweakCount; i += 1)
            {
                var tweak = tweaks[i];

                // check for extra fields
                Parser.extraFields(error, "animation tweaks", tweak, exclude);

                // check type of expected fields
                for (var f in tweak)
                {
                    var ind = exclude.indexOf(f);
                    if (ind === -1)
                    {
                        continue;
                    }
                    if (Types.isNumber(tweak[f]))
                    {
                        tweak[f] = [tweak[f]];
                    }
                    Types.checkAssignment(error, "particle " + parts[i].name, "tweak '" + f + "'",
                                          tweak[f], excludeTypes[ind >>> 1]);
                }
            }

            // Can't reasonably go further in the compile if any errors have occured.
            if (error.checkErrorState())
            {
                throw error.fail("Build failed!");
            }

            for (i = 0; i < tweakCount; i += 1)
            {
                ParticleBuilder.applyTweak(sys, parts[i], tweaks[i]);
            }
        }

        // Check for any warnings at any point during compile
        if (!error.empty(failOnWarnings))
        {
            throw error.fail("Build failed! (fail on warnings enabled)");
        }

        // ----------------------------------------------------
        // No errors/warnings are generated from this point on.

        // Discretise for each output frame of animation texture.
        for (i = 0; i < count; i += 1)
        {
            ParticleBuilder.discretize(sys, parts[i]);
        }

        // Clamp attributes of animation frames.
        for (i = 0; i < count; i += 1)
        {
            ParticleBuilder.clampAttributes(sys, parts[i]);
        }

        // Compute min/max for normalized attribute storages.
        var minDelta = ParticleBuilder.attributesMapping(sys, parts);

        // Normalise attributes if required
        for (i = 0; i < count; i += 1)
        {
            ParticleBuilder.normalizeAttributes(sys, parts[i], minDelta);
        }

        // Build texture data
        var width = 0;
        for (i = 0; i < count; i += 1)
        {
            width += parts[i].animation.length;
        }
        var data = ParticleBuilder.compileData(sys, width, parts);

        // Build output maps
        var particleDefns = {};
        var maxLifeTime = 0;
        var prev = 0;
        for (i = 0; i < count; i += 1)
        {
            var particle = parts[i];
            var seq = particle.animation;
            var lifeTime = seq[seq.length - 1].time;
            if (lifeTime > maxLifeTime)
            {
                maxLifeTime = lifeTime;
            }
            particleDefns[particle.name] = {
                lifeTime: lifeTime,
                animationRange: [(prev + 0.5) / width, (prev + seq.length - 0.5) / width]
            };
            prev += seq.length;
        }

        return {
            maxLifeTime: maxLifeTime,
            animation: ParticleBuilder.buildAnimationTexture(graphicsDevice, width, sys.length, data),
            particle: particleDefns,
            attribute: minDelta
        };
    }

    private static compileData(system: Array<Attribute>, width: number, particles: Array<Particle>): Uint8Array
    {
        var height = 0;
        var sysCount = system.length;
        var i;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            var dim = (Types.isNumber(attr.type) ? 4 : attr.defaultValue.length);
            switch (attr.compress)
            {
                case AttributeCompress.cHalf:
                    // 1 -> 1, 2 -> 1, 4 -> 2
                    dim = Math.ceil(dim / 2);
                    break;
                case AttributeCompress.cFull:
                    // _ -> 1
                    dim = Math.ceil(dim / 4);
                    break;
                default:
                    // _ -> _
            }
            height += dim;
        }

        var count = width * height;
        var data = new Uint32Array(count);
        var store = 0;

        var partCount = particles.length;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            var j;
            for (j = 0; j < partCount; j += 1)
            {
                var particle = particles[j];
                var seq = particle.animation;
                var seqCount = seq.length;
                var k;
                for (k = 0; k < seqCount; k += 1)
                {
                    var value = seq[k].attributes[attr.name];
                    switch (attr.type)
                    {
                        case "tFloat":
                            data[store] = TextureEncode.encodeUnsignedFloat(value[0]);
                            break;
                        case "tFloat2":
                            if (attr.compress !== AttributeCompress.cNone)
                            {
                                data[store] = TextureEncode.encodeUnsignedFloat2(value);
                            }
                            else
                            {
                                data[store + (width * 0)] = TextureEncode.encodeUnsignedFloat(value[0]);
                                data[store + (width * 1)] = TextureEncode.encodeUnsignedFloat(value[1]);
                            }
                            break;
                        default:
                            if (attr.type !== "tFloat4")
                            {
                                var uvs = particle.textureUVs["texture" + <number>attr.type];
                                var ind = (value[0] | 0);
                                value = uvs[ind];
                            }
                            if (attr.compress === AttributeCompress.cFull)
                            {
                                data[store] = TextureEncode.encodeUnsignedFloat4(value);
                            }
                            else if (attr.compress === AttributeCompress.cNone)
                            {
                                data[store + (width * 0)] = TextureEncode.encodeUnsignedFloat(value[0]);
                                data[store + (width * 1)] = TextureEncode.encodeUnsignedFloat(value[1]);
                                data[store + (width * 2)] = TextureEncode.encodeUnsignedFloat(value[2]);
                                data[store + (width * 3)] = TextureEncode.encodeUnsignedFloat(value[3]);
                            }
                            else
                            {
                                data[store + (width * 0)] = TextureEncode.encodeUnsignedFloat2(value.slice(0, 2));
                                data[store + (width * 1)] = TextureEncode.encodeUnsignedFloat2(value.slice(2, 4));
                            }
                    }
                    store += 1;
                }
            }
        }
        return new Uint8Array(data.buffer);
    }

    private static normalizeAttributes(
        system: Array<Attribute>, particle: Particle, minDelta: { [name: string]: AttributeRange }): void
    {
        var res: { [name: string]: AttributeRange } = {};
        var inf = Number.POSITIVE_INFINITY;

        var sysCount = system.length;
        var i;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            if (attr.storage !== AttributeStorage.sNormalized)
            {
                continue;
            }

            var md = minDelta[attr.name];
            var dim = md.min.length;
            var seq = particle.animation;
            var seqCount = seq.length;
            var j;
            for (j = 0; j < seqCount; j += 1)
            {
                var value = seq[j].attributes[attr.name];
                var k;
                for (k = 0; k < dim; k += 1)
                {
                    value[k] = (value[k] - md.min[k]) * (md.delta[k] === 0 ? 1 : (1 / md.delta[k]));
                }
            }
        }
    }

    private static attributesMapping(system: Array<Attribute>, particles: Array<Particle>)
    {
        var res: { [name: string]: AttributeRange } = {};
        var inf = Number.POSITIVE_INFINITY;

        var sysCount = system.length;
        var i;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            if (attr.storage !== AttributeStorage.sNormalized)
            {
                continue;
            }

            var min, max, dim;
            switch (attr.type)
            {
                case "tFloat2":
                    min = [inf, inf];
                    max = [-inf, -inf];
                    dim = 2;
                    break;
                case "tFloat4":
                    min = [inf, inf, inf, inf];
                    max = [-inf, -inf, -inf, -inf];
                    dim = 4;
                    break;
                default: // tFloat | tTexture(n) <-- unused, textures can never be normalized.
                    min = [inf];
                    max = [-inf];
                    dim = 1;
            }

            var count = particles.length;
            var j;
            for (j = 0; j < count; j += 1)
            {
                var particle = particles[j];
                var seq = particle.animation;
                var seqCount = seq.length;
                var k;
                for (k = 0; k < seqCount; k += 1)
                {
                    var value = seq[k].attributes[attr.name];
                    var r;
                    for (r = 0; r < dim; r += 1)
                    {
                        if (value[r] < min[r])
                        {
                            min[r] = value[r];
                        }
                        if (value[r] > max[r])
                        {
                            max[r] = value[r];
                        }
                    }
                }
            }

            var delta = [];
            for (j = 0; j < dim; j += 1)
            {
                delta[j] = (max[j] - min[j]);
            }

            res[attr.name] = {
                min: min,
                delta: delta
            };
        }
        return res;
    }

    private static clampAttributes(system: Array<Attribute>, particle: Particle): void
    {
        var seq = particle.animation;
        var seqCount = seq.length;
        if (seqCount === 0)
        {
            return;
        }

        var sysCount = system.length;
        var i;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            var min = attr.minValue;
            var max = attr.maxValue;
            if (Types.isNumber(attr.type))
            {
                // tTexture(n)
                min = [0];
                max = [particle.textureUVs["texture"+(<number>attr.type)].length - 1];
            }

            var dim = seq[0].attributes[attr.name].length;
            var j;
            for (j = 0; j < seqCount; j += 1)
            {
                var snap = seq[j].attributes[attr.name];
                var k;
                for (k = 0; k < dim; k += 1)
                {
                    if (min[k] !== null && snap[k] < min[k])
                    {
                        snap[k] = min[k];
                    }
                    if (max[k] !== null && snap[k] > max[k])
                    {
                        snap[k] = max[k];
                    }
                }
            }
        }
    }

    private static setDefaults(particle: Particle, system: Array<Attribute>): void
    {
        if (particle.animation.length === 0)
        {
            return;
        }

        var snap = particle.animation[0];
        var count = system.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var attr = system[i];
            if (!snap.attributes.hasOwnProperty(attr.name))
            {
                snap.attributes[attr.name] = attr.defaultValue;
            }
            if (!snap.interpolators.hasOwnProperty(attr.name))
            {
                snap.interpolators[attr.name] = attr.defaultInterpolator;
            }
        }
    }

    private static applyTweak(system: Array<Attribute>, particle: Particle, tweak: { [name: string]: Array<number> }): void
    {
        var sysCount = system.length;
        var i;
        for (i = 0; i < sysCount; i += 1)
        {
            var attr = system[i];
            var scaleName = attr.name + "-scale";
            var offsetName = attr.name + "-offset";
            var scale = null, offset = null;
            if (tweak.hasOwnProperty(scaleName))
            {
                scale = tweak[scaleName];
            }
            if (tweak.hasOwnProperty(offsetName))
            {
                offset = tweak[offsetName];
            }

            if (!scale && !offset)
            {
                continue;
            }

            var seq = particle.animation;
            var seqCount = seq.length;
            var dim = scale ? scale.length : offset.length;
            var j;
            for (j = 0; j < seqCount; j += 1)
            {
                var snap = seq[j].attributes[attr.name];
                var k;
                for (k = 0; k < dim; k += 1)
                {
                    if (scale)
                    {
                        snap[k] *= scale[k];
                    }
                    if (offset)
                    {
                        snap[k] += offset[k];
                    }
                }
            }
        }
    }

    private static remapUVs(particle: Particle, uvMap: { [name: string]: Array<Array<number>> }, index: number): void
    {
        for (var f in particle.textureUVs)
        {
            if (particle.textureUVs.hasOwnProperty(f) && uvMap.hasOwnProperty(f))
            {
                var uvs = particle.textureUVs[f];
                var count = uvs.length;
                var maps = uvMap[f];
                if (maps.length <= index)
                {
                    continue;
                }

                var map = maps[index];
                var i;
                for (i = 0; i < count; i += 1)
                {
                    var uv = uvs[i];
                    uv[0] = map[0] + (uv[0] * (map[2] - map[0]));
                    uv[1] = map[1] + (uv[1] * (map[3] - map[1]));
                    uv[2] = map[0] + (uv[2] * (map[2] - map[0]));
                    uv[3] = map[1] + (uv[3] * (map[3] - map[1]));
                }
            }
        }
    }

    // Interpolate for value of attribute 'attr' at time 'time'
    // using whatever snapshots are defined before and after the given time and
    // define the attribute, using the interpolator defined on the preceeding
    // snapshot defining an interpolator.
    //
    // Assume there is at least 1 snapshot <= time defining the attribute
    // and atleast 1 snapshot <= time defining an interpolator.
    private static interpolate(
        snaps: Array<Snapshot>,
        attr: Attribute,
        time: number): Array<number>
    {
        var intp = null;
        var back = [];
        var forth = [];

        var count = snaps.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var snap = snaps[i];
            if (snap.time <= time)
            {
                if (snap.attributes.hasOwnProperty(attr.name))
                {
                    back.push(snap);
                }
                if (snap.interpolators.hasOwnProperty(attr.name))
                {
                    intp = snap.interpolators[attr.name];
                }
            }
            else
            {
                if (snap.attributes.hasOwnProperty(attr.name))
                {
                    forth.push(snap);
                }
            }
        }

        var ts = [];
        var vs = [];
        var offsets = intp.offsets;
        count = offsets.length;
        for (i = 0; i < count; i += 1)
        {
            var offset = offsets[i];
            // assume offset <> 0
            if (offset > 0)
            {
                offset -= 1;
                if (offset < forth.length)
                {
                    ts.push(forth[offset].time);
                    vs.push(forth[offset].attributes[attr.name]);
                }
                else
                {
                    ts.push(null);
                    vs.push(null);
                }
            }
            else
            {
                offset += back.length;
                if (offset >= 0)
                {
                    ts.push(back[offset].time);
                    vs.push(back[offset].attributes[attr.name]);
                }
                else
                {
                    ts.push(null);
                    vs.push(null);
                }
            }
        }

        var t;
        if (forth.length === 0)
        {
            t = 0;
        }
        else
        {
            var prev = back[back.length - 1];
            var next = forth[0];
            t = (time - prev.time) / (next.time - prev.time);
        }

        return intp.fun(vs, ts, t);
    }

    // Discretise particle animation to have exact (interpolated) snapshots in its single sequence
    // based on fps.
    //
    // pre: animation has been flattened
    private static discretize(system: Array<Attribute>, particle: Particle): void
    {
        var disc = [];
        var snaps = particle.animation;
        var seqLength = snaps.length;
        var count = system.length;
        var attr, i, chunk;
        if (seqLength === 0)
        {
            // Get defaults from system
            // No longer care about interpolators being defined.
            chunk = {
                time: 0.0,
                attributes: {},
                interpolators: {}
            };

            for (i = 0; i < count; i += 1)
            {
                attr = system[i];
                chunk.attributes[attr.name] = attr.defaultValue.concat();
            }

            disc = [chunk];
        }
        else if (seqLength === 1)
        {
            disc = snaps;
        }
        else
        {
            var time = 0.0;
            // convert relative times to absolute times for snapshots.
            for (i = 0; i < seqLength; i += 1)
            {
                snaps[i].time += time;
                time = snaps[i].time;
            }
            var lastTime = time;

            time = 0.0;
            var granularity = 1 / particle.fps;
            while (time <= lastTime)
            {
                // No longer care about interpolators being defined.
                chunk = {
                    time: time,
                    attributes: {},
                    interpolators: {}
                };

                var i;
                for (i = 0; i < count; i += 1)
                {
                    attr = system[i];
                    chunk.attributes[attr.name] =
                        ParticleBuilder.interpolate(snaps, attr, time);
                }

                disc.push(chunk);
                time += granularity;
            }

            // Depending on granularity, may have missed last snapshot.
            if (disc[disc.length - 1].time < snaps[seqLength - 1].time)
            {
                disc.push(snaps[seqLength - 1]);
            }
        }
        particle.animation = disc;
    }

    private static checkAttributes(error: BuildError, particle: Particle, system: Array<Attribute>): void
    {
        var sysAttr;
        var seq = particle.animation;
        if (!seq)
        {
            return;
        }

        var count = seq.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var snap = seq[i];
            var interpolators = snap.interpolators;
            for (var attr in interpolators)
            {
                if (interpolators.hasOwnProperty(attr) &&
                    !ParticleBuilder.getAttribute(system, attr))
                {
                    error.warning("particle " + particle.name + " references attribute '" + attr +
                                  "' not defined in system");
                }
            }
            var attributes = snap.attributes;
            for (var attr in attributes)
            {
                if (!attributes.hasOwnProperty(attr))
                {
                    continue;
                }
                sysAttr = ParticleBuilder.getAttribute(system, attr);
                if (!sysAttr)
                {
                    error.warning("particle " + particle.name + " references attribute '" + attr +
                                  "' not defined in system");
                }
                else
                {
                    var value = attributes[attr];
                    Types.checkAssignment(error, "particle " + particle.name, "attribute '" + attr + "'",
                                          value, sysAttr.type);
                }
            }
        }
        count = system.length;
        for (i = 0; i < count; i += 1)
        {
            sysAttr = system[i];
            switch (sysAttr.type)
            {
                case "tFloat": case "tFloat2": case "tFloat4": break;
                default: // tTexture(n)
                    if (!particle.textureUVs.hasOwnProperty("texture" + (<number>sysAttr.type)))
                    {
                        particle.textureUVs["texture" + (<number>sysAttr.type)] = [[0.0, 0.0, 1.0, 1.0]];
                    }
            }
        }
    }

    private static getAttribute(system: Array<Attribute>, name: string): Attribute
    {
        var ret = null;
        var count = system.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var attr = system[i];
            if (attr.name === name)
            {
                ret = attr;
                break;
            }
        }
        return ret;
    }

    private static normalizeParticleUVs(particle: Particle): void
    {
        for (var f in particle.textureUVs)
        {
            if (!particle.textureUVs.hasOwnProperty(f) || !particle.textureSizes.hasOwnProperty(f))
            {
                continue;
            }

            // normalize
            var uvs = particle.textureUVs[f];
            var size = particle.textureSizes[f];
            var invSizeX = 1 / size[0];
            var invSizeY = 1 / size[1];
            var uvCount = uvs.length;
            var j;
            for (j = 0; j < uvCount; j += 1)
            {
                uvs[j][0] *= invSizeX;
                uvs[j][1] *= invSizeY;
                uvs[j][2] *= invSizeX;
                uvs[j][3] *= invSizeY;
            }
        }
    }
}



//
// SharedRenderContext
//
// Deals with allocating texture stores for particle states/mapping tables
// and invalidating systems/views when stores are resized.
//
interface Context
{
    width: number;
    height: number;
    renderTargets: Array<RenderTarget>;
    store: Array<{
        fit : PackedRect;
        set : (ctx: AllocatedContext) => void;
    }>
}
interface AllocatedContext
{
    renderTargets: Array<RenderTarget>;
    uvRectangle: Array<number>;
}
class SharedRenderContext
{
    private graphicsDevice: GraphicsDevice;
    private contexts: Array<Context>;
    private packer: OnlineTexturePacker;

    private static textureVertices : VertexBuffer;
    private static textureSemantics: Semantics;
    private static copyParameters  : TechniqueParameters;
    private static copyTechnique   : Technique;
    private static init(graphicsDevice: GraphicsDevice): void
    {
        if (!SharedRenderContext.textureVertices)
        {
            SharedRenderContext.textureVertices =
                graphicsDevice.createVertexBuffer({
                    numVertices: 4,
                    attributes : [graphicsDevice.VERTEXFORMAT_FLOAT2],
                    dynamic    : false,
                    data       : [0,0, 1,0, 0,1, 1,1]
                });
            SharedRenderContext.textureSemantics =
                graphicsDevice.createSemantics([
                    graphicsDevice.SEMANTIC_POSITION
                ]);
            SharedRenderContext.copyParameters =
                graphicsDevice.createTechniqueParameters({
                    dim: [0, 0],
                    dst: [0, 0, 0, 0]
                });

            // Shader embedded from assets/shaders/particles-copy.cgfx
            var shader = graphicsDevice.createShader({"version": 1,"name": "particles-copy.cgfx","samplers":{"src":{"MinFilter": 9728,"MagFilter": 9728,"WrapS": 33071,"WrapT": 33071}},"parameters":{"src":{"type": "sampler2D"},"dim":{"type": "float","columns": 2},"dst":{"type": "float","columns": 4}},"techniques":{"copy":[{"parameters": ["dst","src"],"semantics": ["POSITION"],"states":{"DepthTestEnable": false,"DepthMask": false,"CullFaceEnable": false,"BlendEnable": false},"programs": ["vp_copy","fp_copy"]}]},"programs":{"fp_copy":{"type": "fragment","code": "#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying vec4 tz_TexCoord[1];\nvec4 _ret_0;uniform sampler2D src;void main()\n{_ret_0=texture2D(src,tz_TexCoord[0].xy);gl_FragColor=_ret_0;}"},"vp_copy":{"type": "vertex","code": "#ifdef GL_ES\n#define TZ_LOWP lowp\nprecision mediump float;\nprecision mediump int;\n#else\n#define TZ_LOWP\n#endif\nvarying vec4 tz_TexCoord[1];attribute vec4 ATTR0;\nvec4 _outPosition1;vec2 _outUV1;uniform vec4 dst;void main()\n{vec2 _xy;vec2 _wh;vec2 _TMP3;_xy=dst.xy*2.0-1.0;_wh=(dst.zw*2.0-1.0)-_xy;_TMP3=_xy+_wh*ATTR0.xy;_outPosition1=vec4(_TMP3.x,_TMP3.y,0.0,1.0);_outUV1=ATTR0.xy;tz_TexCoord[0].xy=ATTR0.xy;gl_Position=_outPosition1;}"}}});
            SharedRenderContext.copyTechnique = shader.getTechnique("copy");
        }
    }

    static create(params: {
        graphicsDevice: GraphicsDevice
    }): SharedRenderContext
    {
        return new SharedRenderContext(params);
    }

    constructor(params: {
        graphicsDevice: GraphicsDevice
    })
    {
        this.graphicsDevice = params.graphicsDevice;
        SharedRenderContext.init(this.graphicsDevice);
        var max = this.graphicsDevice.maxSupported("TEXTURE_SIZE");
        this.packer = new OnlineTexturePacker(max, max);
        this.contexts = [];
    }

    allocate(params: {
        set: (ctx: AllocatedContext) => void;
        width: number;
        height: number;
    }): AllocatedContext
    {
        var fit = this.packer.pack(params.width, params.height);

        var bin = fit.bin;
        var ctxW = this.packer.bins[bin].w;
        var ctxH = this.packer.bins[bin].h;
        if (bin >= this.contexts.length)
        {
            this.allocateContext(ctxW, ctxH);
        }

        var ctx = this.contexts[bin];
        if (ctxW > ctx.width || ctxH > ctx.height)
        {
            ctx = this.contexts[bin] = this.resizeContext(ctx, ctxW, ctxH);
        }

        ctx.store.push({
            set: params.set,
            fit: fit
        });

        return {
            renderTargets: ctx.renderTargets,
            uvRectangle: [fit.x, fit.y, fit.x + fit.w, fit.y + fit.h]
        };
    }

    private allocateContext(w, h)
    {
        this.contexts.push(SharedRenderContext.createContext(this.graphicsDevice, w, h));
    }

    private resizeContext(ctx: Context, w, h)
    {
        // don't resize to exactly the required size.
        // instead scale up to a larger size to reduce
        // the number of times we need to resize.
        //
        // whilst multiplication by 2 is optimal in terms of resize counts
        // we don't want to waste too much texture space.
        var newW = ctx.width;
        var newH = ctx.height;
        while (newW < w)
        {
            newW = (newW * 1.25) | 0;
        }
        while (newH < h)
        {
            newH = (newH * 1.25) | 0;
        }
        if (newW > this.packer.maxWidth)
        {
            newW = this.packer.maxWidth;
        }
        if (newH > this.packer.maxHeight)
        {
            newH = this.packer.maxHeight;
        }
        w = newW;
        h = newH;

        var gd = this.graphicsDevice;
        var newCtx = SharedRenderContext.createContext(gd, w, h);
        SharedRenderContext.copyTexture(gd, ctx.renderTargets[0], newCtx.renderTargets[0]);
        SharedRenderContext.copyTexture(gd, ctx.renderTargets[1], newCtx.renderTargets[1]);
        ctx.renderTargets[0].colorTexture0.destroy();
        ctx.renderTargets[1].colorTexture0.destroy();
        ctx.renderTargets[0].destroy();
        ctx.renderTargets[1].destroy();

        var invW = 1 / w;
        var invH = 1 / h;

        var store = ctx.store;
        var newStore = newCtx.store;
        var count = store.length;
        var i;
        for (i = 0; i < count; i += 1)
        {
            var elt = store[i];
            var fit = elt.fit;
            newStore.push(elt);
            elt.set({
                renderTargets: newCtx.renderTargets,
                uvRectangle: [fit.x * invW, fit.y * invH, (fit.x + fit.w) * invW, (fit.y + fit.h) * invH]
            });
        }
        return newCtx;
    }

    private static copyTexture(gd: GraphicsDevice, from: RenderTarget, to: RenderTarget): void
    {
        var parameters = SharedRenderContext.copyParameters;
        var technique = SharedRenderContext.copyTechnique;
        var vertices = SharedRenderContext.textureVertices;
        var semantics = SharedRenderContext.textureSemantics;

        parameters["src"] = from.colorTexture0;
        parameters["dst"] = [
            0, 0,
            from.width / to.colorTexture0.width,
            from.height / to.colorTexture0.height
        ];

        gd.beginRenderTarget(to);
        gd.setStream(vertices, semantics);
        gd.setTechnique(technique);
        gd.setTechniqueParameters(parameters);
        gd.draw(gd.PRIMITIVE_TRIANGLE_STRIP, 4, 0);
        gd.endRenderTarget();
    }

    private static createContext(gd: GraphicsDevice, w, h)
    {
        var targets = [];
        var i;
        for (i = 0; i < 2; i += 1)
        {
            var tex = gd.createTexture({
                name: "SharedRenderContext Context Texture " + i,
                depth: 1,
                width: w,
                height: h,
                format: gd.PIXELFORMAT_R8G8B8A8,
                mipmaps: false,
                cubemap: false,
                dynamic: true,
                renderable: true
            });
            targets.push(gd.createRenderTarget({ colorTexture0: tex }));
        }

        return {
            width: w,
            height: h,
            store: [],
            renderTargets: targets,
        };
    }
}



//
// ParticleSystem
//
class ParticleSystem
{
}

