class DAGEngine {
  constructor() {
    this.jobs = new Map();
    this.edges = new Map(); // job -> dependencies
  }

  addJob(jobId, dependencies = []) {
    this.jobs.set(jobId, { id: jobId, status: 'pending' });
    this.edges.set(jobId, dependencies);
  }

  // Topological Sort — dependency order nikalta hai
  topologicalSort() {
    const visited = new Set();
    const result = [];

    const dfs = (jobId) => {
      if (visited.has(jobId)) return;
      visited.add(jobId);

      const deps = this.edges.get(jobId) || [];
      for (const dep of deps) {
        dfs(dep);
      }

      result.push(jobId);
    };

    for (const jobId of this.jobs.keys()) {
      dfs(jobId);
    }

    return result;
  }

  // Cycle check 
  hasCycle() {
    const visited = new Set();
    const recursionStack = new Set();

    const dfs = (jobId) => {
      visited.add(jobId);
      recursionStack.add(jobId);

      const deps = this.edges.get(jobId) || [];
      for (const dep of deps) {
        if (!visited.has(dep)) {
          if (dfs(dep)) return true;
        } else if (recursionStack.has(dep)) {
          return true;
        }
      }

      recursionStack.delete(jobId);
      return false;
    };

    for (const jobId of this.jobs.keys()) {
      if (!visited.has(jobId)) {
        if (dfs(jobId)) return true;
      }
    }

    return false;
  }

  getExecutionOrder() {
    if (this.hasCycle()) {
      throw new Error('Circular dependency detected in jobs!');
    }
    return this.topologicalSort();
  }
}

module.exports = DAGEngine;