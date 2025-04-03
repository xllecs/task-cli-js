#!/usr/bin/env node

import { program } from 'commander'
import fs from 'fs'

let tasks

try {
  tasks = JSON.parse(fs.readFileSync('tasks.json'))
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('file not found. creating one for you...')
    fs.appendFileSync('tasks.json', '[]', () => console.log('tasks.json created'))
    tasks = []
  } else {
    throw error
  }
}

program
  .command('list')
  .option('--not-started')
  .option('--in-progress')
  .option('--done')
  .action(options => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))

    if (tasks.length === 0) {
      console.log('there are no tasks')
      return
    }

    if (Object.keys(options).length !== 0) {
      tasks.forEach(task => {
        const { title, desc, status } = Object.values(task)[0]

        const camelizedStatus = status.replace(/\s./g, (match) => {
          return match.toUpperCase()
        }).replace(/\s+/g, '')

        if (camelizedStatus === Object.keys(options)[0]) {
          console.log(
            `title: ${title}
description: ${desc}
status: ${status}
`)
        }
      })
    } else {
      tasks.forEach(task => {
        const { title, desc, status } = Object.values(task)[0]
        console.log(
          `title: ${title}
description: ${desc}
status: ${status}
`)
      })
    }
  })

program
  .command('add <title> <desc> [status]')
  .action((title, desc, status = 'not started') => {
    let taskId = 1

    for (let task of tasks) {
      taskId = Object.keys(task)[0]

      if (Object.values(task)[0].title === title) {
        console.log('task already exists')
        return
      }
    }

    const task = {
      [Number(taskId) + 1]: {
        title, desc, status
      }
    }

    tasks.push(task)

    fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
    console.log('task added successfully')
  })

program
  .command('delete <todoId>')
  .action(taskId => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))

    for (let [index, task] of tasks.entries()) {
      if (Object.keys(task)[0] === taskId) {
        tasks.splice(index, 1)
        console.log('task deleted successfully')
        fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
        return
      }
    }

    console.log('task not found')
  })

program
  .command('update <taskId>')
  .option('--title <title>')
  .option('--desc <desc>')
  .action((taskId, options, title, desc) => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))
    
    if (!options.title && !options.desc) {
      console.log('no changes')
      return
    }

    for (let task of tasks) {
      if (Object.keys(task)[0] === taskId) {
        if (options.title) Object.values(task)[0].title = options.title
        if (options.desc) Object.values(task)[0].desc = options.desc

        fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
        console.log('task updated successfully')

        return
      }
    }

    console.log('task not found')
  })

program
  .command('mark <taskId>')
  .option('--not-started')
  .option('--in-progress')
  .option('--done')
  .action((taskId, options) => {
    let tasks = JSON.parse(fs.readFileSync('tasks.json'))

    for (let task of tasks) {
      if (Object.keys(task)[0] === taskId) {
        const camelizedStatus = Object.values(task)[0].status.replace(/\s./g, (match) => {
          return match.toUpperCase()
        }).replace(/\s+/g, '')

        if (options.notStarted) {
          if (camelizedStatus === Object.keys(options)[0]) {
            console.log('cannot mark task as not started since it was not started yet')
            return
          }

          Object.values(task)[0].status = 'not started'
          fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
          console.log('status updated successfully')
          return
        }

        if (options.inProgress) {
          if (camelizedStatus === Object.keys(options)[0]) {
            console.log('cannot mark task as in progress since it\'s already in progress')
            return
          }

          Object.values(task)[0].status = 'in progress'
          fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
          console.log('status updated successfully')
          return
        }

        if (options.done) {
          if (camelizedStatus === Object.keys(options)[0]) {
            console.log('cannot mark task as done since it\'s already done.')
            return
          }

          Object.values(task)[0].status = 'done'
          fs.writeFileSync('tasks.json', JSON.stringify(tasks), 'utf8')
          console.log('status updated successfully')
          return
        }
      }
    }
  })

program.parse(process.argv)
