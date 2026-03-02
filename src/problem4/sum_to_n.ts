// Native js reduce
function sum_to_n_a(n: number): number {
    return Array.from({ length: n }, (_, i) => i + 1).reduce((acc, curr) => acc + curr, 0);
}

// Iterative implementation (for loop)
function sum_to_n_b(n: number): number {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Recursive implementation
function sum_to_n_c(n: number): number {
    if (n <= 1) {
        return n;
    }
    return n + sum_to_n_c(n - 1);
}

// Other approaches to consider (searched on Chatgpt)
// -  Mathematical Formula (Arithmetic Progression): (n * (n + 1)) / 2 (since the calculation is done in a single mathematical step regardless of the size of `n`. This is the most efficient approach with O(1) time complexity and O(1) space complexity.)
// - While loop implementation: same as for loop implementation but with while loop, same time and space complexity ofcourse.
