import { LessonRequest, LessonResponse } from '@/types/lesson';

const MOCK_LESSON: LessonResponse = {
  objective: "Understand how to optimize pandas groupby operations for better performance with large datasets.",
  total_minutes: 15,
  sections: [
    {
      id: "objective",
      title: "Objective",
      minutes: 1,
      content_markdown: `By the end of this lesson, you will understand how to write efficient \`groupby\` operations in pandas and avoid common performance pitfalls when working with large datasets.`
    },
    {
      id: "concept",
      title: "Concept",
      minutes: 4,
      content_markdown: `## Understanding GroupBy Performance

The pandas \`groupby\` operation is powerful but can become slow with large datasets. Here are the key concepts:

### How GroupBy Works Internally

1. **Splitting**: Data is divided into groups based on the grouping key
2. **Applying**: A function is applied to each group
3. **Combining**: Results are combined into a new DataFrame

### Common Performance Issues

- Using \`apply()\` with custom Python functions (slow due to Python overhead)
- Iterating over groups manually
- Not using categorical dtypes for grouping columns
- Performing multiple separate aggregations instead of using \`agg()\`

### Optimization Strategies

| Strategy | Impact |
|----------|--------|
| Use categorical dtypes | 2-10x faster |
| Use built-in aggregations | 10-100x faster than apply |
| Use \`agg()\` for multiple operations | Reduces overhead |
| Consider \`numba\` for custom functions | Near-C performance |`
    },
    {
      id: "example",
      title: "Example",
      minutes: 5,
      content_markdown: `## Practical Example: Sales Data Analysis

Let's compare slow vs. fast approaches for aggregating sales data.

### Slow Approach (Avoid This)

\`\`\`python
import pandas as pd
import numpy as np

# Create sample data
df = pd.DataFrame({
    'category': np.random.choice(['A', 'B', 'C'], size=100000),
    'value': np.random.randn(100000) * 100,
    'quantity': np.random.randint(1, 50, size=100000)
})

# Slow: Using apply with a custom function
def custom_stats(group):
    return pd.Series({
        'mean': group['value'].mean(),
        'total': group['quantity'].sum()
    })

result_slow = df.groupby('category').apply(custom_stats)
\`\`\`

### Fast Approach (Use This)

\`\`\`python
import pandas as pd
import numpy as np

# Create sample data with categorical dtype
df = pd.DataFrame({
    'category': pd.Categorical(np.random.choice(['A', 'B', 'C'], size=100000)),
    'value': np.random.randn(100000) * 100,
    'quantity': np.random.randint(1, 50, size=100000)
})

# Fast: Using built-in aggregations with agg()
result_fast = df.groupby('category').agg({
    'value': 'mean',
    'quantity': 'sum'
}).rename(columns={'value': 'mean', 'quantity': 'total'})

print(result_fast)
\`\`\`

The fast approach can be **10-50x faster** depending on data size and complexity.`
    },
    {
      id: "exercise",
      title: "Exercise",
      minutes: 3,
      content_markdown: `## Practice Exercise

:::exercise
**Task**: Optimize the following slow groupby operation.

Given this DataFrame:
\`\`\`python
import pandas as pd
df = pd.DataFrame({
    'region': ['North', 'South', 'East', 'West'] * 25000,
    'sales': range(100000),
    'returns': range(0, 200000, 2)
})
\`\`\`

Rewrite this slow code:
\`\`\`python
def calc_metrics(g):
    return pd.Series({
        'total_sales': g['sales'].sum(),
        'avg_returns': g['returns'].mean(),
        'count': len(g)
    })
result = df.groupby('region').apply(calc_metrics)
\`\`\`

**Hints**:
1. Convert 'region' to categorical dtype
2. Use the \`agg()\` method with built-in functions
3. Use \`size()\` or include a count in your aggregation
:::

### Expected Output Format

Your optimized code should produce the same results but run significantly faster.`
    },
    {
      id: "summary",
      title: "Summary",
      minutes: 2,
      content_markdown: `## Key Takeaways

### Do's ✓
- **Use categorical dtypes** for grouping columns
- **Use built-in aggregations** (\`sum\`, \`mean\`, \`count\`, etc.)
- **Use \`agg()\`** for multiple aggregations in one call
- **Profile your code** with \`%timeit\` or \`time.perf_counter()\`

### Don'ts ✗
- Avoid \`apply()\` with custom Python functions when possible
- Don't iterate over groups with \`for name, group in df.groupby(...)\`
- Don't perform multiple separate \`groupby\` calls on the same data

### Performance Comparison

\`\`\`python
# Quick benchmark template
import time

start = time.perf_counter()
# Your groupby operation here
result = df.groupby('category').agg({'value': 'mean'})
end = time.perf_counter()

print(f"Execution time: {end - start:.4f} seconds")
\`\`\`

### Next Steps
- Explore \`transform()\` for group-wise operations that maintain index
- Learn about \`numba\` for custom aggregations that need to be fast
- Consider Polars or DuckDB for extremely large datasets`
    }
  ]
};

export async function generateLesson(request: LessonRequest): Promise<LessonResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return mocked lesson data
  // In production, this would be: return fetch('/lesson', { method: 'POST', body: JSON.stringify(request) }).then(r => r.json())
  return {
    ...MOCK_LESSON,
    objective: `Learn about ${request.topic} at the ${request.level} level. ${MOCK_LESSON.objective}`
  };
}
