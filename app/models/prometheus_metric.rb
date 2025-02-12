# frozen_string_literal: true

class PrometheusMetric < ApplicationRecord
  belongs_to :project, validate: true, inverse_of: :prometheus_metrics

  enum group: PrometheusMetricEnums.groups

  validates :title, presence: true
  validates :query, presence: true
  validates :group, presence: true
  validates :y_label, presence: true
  validates :unit, presence: true

  validates :project, presence: true, unless: :common?
  validates :project, absence: true, if: :common?

  scope :common, -> { where(common: true) }

  def priority
    group_details(group).fetch(:priority)
  end

  def group_title
    group_details(group).fetch(:group_title)
  end

  def required_metrics
    group_details(group).fetch(:required_metrics, []).map(&:to_s)
  end

  def to_query_metric
    Gitlab::Prometheus::Metric.new(id: id, title: title, required_metrics: required_metrics, weight: 0, y_label: y_label, queries: queries)
  end

  def queries
    [
      {
        query_range: query,
        unit: unit,
        label: legend,
        series: query_series
      }.compact
    ]
  end

  def query_series
    case legend
    when 'Status Code'
      [{
        label: 'status_code',
        when: [
          { value: '2xx', color: 'green' },
          { value: '4xx', color: 'orange' },
          { value: '5xx', color: 'red' }
        ]
      }]
    end
  end

  private

  def group_details(group)
    PrometheusMetricEnums.group_details.fetch(group.to_sym)
  end
end
