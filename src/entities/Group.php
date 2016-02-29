<?php
namespace SeArch\Entities;
/**
 * @Entity
 * @Table(name="website_groups")
 */
class Group {
	/**
	 * @Id @Column(type="integer")
	 * @GeneratedValue
	 */
	private $id;
	/** @Column(type="text") */
	private $name;
	/** @Column(type="integer") */
	private $order_legend;
	/**
	 * @OneToMany(targetEntity="Category", mappedBy="group")
	 * @OrderBy({"order_legend" = "ASC"})
	 **/
	private $categories;

	public function getName() {
		return $this->name;
	}
	public function getCategories() {
		return $this->categories;
	}
}
